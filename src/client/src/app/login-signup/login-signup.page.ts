import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../profile/user.service';
import { VerifyUser } from '../profile/user';
import { Subscription, throwError } from 'rxjs';
import { skip } from 'rxjs/operators';
import { StorageService } from '../storage.service';
import { Platform } from '@ionic/angular';
import { ToastService } from '../utils/toast.service';
@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.page.html',
  styleUrls: ['./login-signup.page.scss'],
})
export class LoginSignupPage implements OnInit, OnDestroy {
  userSubscription: Subscription;
  public emailId;
  public isIOS: boolean;
  constructor(
    private router: Router,
    private userService: UserService,
    private storageService: StorageService,
    private platform: Platform,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    if (
      (this.platform.is('ios') || this.platform.is('iphone')) &&
      this.platform.is('mobile')
    ) {
      this.isIOS = true;
    } else {
      //web application
      this.isIOS = false;
    }
  }

  ionViewWillEnter() {
    this.emailId = '';

    this.userSubscription = this.userService.userVerificationStatus$
      .pipe(skip(1))
      .subscribe((user: VerifyUser) => {
        if (user.userExists) {
          this.router.navigate(['/loginPassword']);
        }
      });
  }

  getUser() {
    (document.activeElement as HTMLElement).blur();
    if (
      this.emailId != '' &&
      this.emailId.includes('@') &&
      this.emailId.includes('.')
    ) {
      sessionStorage.setItem('userEmail', this.emailId);
      this.storageService.setStorage('userEmail', this.emailId);
      this.userService.verifyUser(this.emailId);
      // this.userService.fetchUserByEmailId(this.emailId);
    } else {
      this.toastService.presentToast({
        type: 'warning',
        message: `Invalid email format`,
      });
    }
  }

  ionViewWillLeave() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {}
}
