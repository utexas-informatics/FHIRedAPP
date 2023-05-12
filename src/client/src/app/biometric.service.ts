import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { UserService } from './profile/user.service';
import { StorageService } from './storage.service';
import { User } from './profile/user';
import { ToastService } from './utils/toast.service';
import jwt_decode from 'jwt-decode';
import {Subscription} from 'rxjs'

@Injectable({ providedIn: 'root' })
export class BiometricService {
  user: User;
  userSubscription: Subscription;
  constructor(
    private faio: FingerprintAIO,
    private storageService: StorageService,
    private userService: UserService,
    private router: Router,
    private toastService: ToastService
  ) {}

  async showBiometric() {
    const token = await this.storageService.getStorage('token').toPromise();
    const authType = await this.storageService.getStorage('authType').toPromise();
    try {
      this.faio
        .show({ disableBackup: true,  title:'FhiredApp' })
        .then(async (result) => {
          if (result) {
            await this.userService.loading();
            const userEmail = jwt_decode(token.access_token)['email'];
            this.userService
              .getBiometricAccessToken(token['refresh_token'],authType,userEmail)
              .subscribe(
                (response) => {
                  this.storageService
                    .setStorage('token', response)
                    .subscribe(async () => {
                      this.userService.authorizeUser();
                      const userEmail = jwt_decode(token.access_token)['email'];
                      const user = await this.userService.fetchUserByEmailId(
                        userEmail,
                        'false'
                      );
                      this.userSubscription = await this.userService.user$.subscribe((user: User) => {
                        if (user) {
                          this.user = { ...user };
                          this.userService
                            .updateProfile(user['_id'], {
                              lastLoginTime: new Date(),
                            })
                            .subscribe();
                            if (this.userSubscription) {
                              this.userSubscription.unsubscribe();
                            }
                          sessionStorage.removeItem('authType');
                          if (this.isAllDemographicsAvailable()) {
                            this.router.navigate(['/tabs/home']);
                          } else {
                            this.router.navigate(['/profile']);
                          }
                        }
                      });
                    });
                },
                (error) => {
                  this.toastService.presentToastWithClose({
                    message: `Session expired! Please login with other options.`,
                  });
                }
              );
          }
        })
        .catch((error) => {
          if (error.code == '-102') {
            this.toastService.presentToastWithClose({
              message: `Authentication failed!. Please try again.`,
            });
          } else if (error.code == '-106') {
            this.toastService.presentToastWithClose({
              message: `Biometric not enrolled!. Please login with other options.`,
            });
          }
        });
    } catch (e){
      () => {
        this.toastService.presentToastWithClose({
          message: `Something went wrong!. Please login with other options.`,
        });
      };
    }
  }
  isAllDemographicsAvailable(): boolean {
    return (
      !!this.user.firstName &&
      !!this.user.lastName &&
      !!this.user.email &&
      (!!this.user.gender || !!this.user.genderOther) &&
      !!this.user.birthday &&
      !!this.user.phoneNumberPrimary &&
      !!this.user.zip
    );
  }
}
