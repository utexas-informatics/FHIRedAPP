import { Component, NgZone, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { UserService } from './profile/user.service';
import { StorageService } from './storage.service';
import { User } from './profile/user';
const { App } = Plugins;
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  user: User;
  userSubscriber: Subscription;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private location: Location,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    private userService: UserService,
    private storageService: StorageService
  ) {}
  ngOnInit(): void {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.storageService.setStorage(
        'platform',
        JSON.stringify(this.platform.platforms())
      );
      this.statusBar.backgroundColorByHexString('#267a85');
      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(false);
      App.addListener('appUrlOpen', (data: any) => {
        this.zone.run(async () => {
          const slug = data.url;
          if (data.url.includes('callback')) {
            const hash = slug.split('callback/')[1];
            this.initiateAutoLogin(hash);
          }
        });
        setTimeout(() => {
          this.splashScreen.hide();
        }, 5000);
      });
      if (this.platform.backButton) {
        this.platform.backButton.subscribeWithPriority(10, async () => {
          // TBD - make /profile or /home conditional based on first time login after signup
          this.storageService.getStorage('userInfo').subscribe((data) => {
            if (data) {
              if (!data?.isNewUser && this.location.path() === '/invite') {
                App.exitApp();
              } else if (
                this.location.path() === '' ||
                this.location.path() === '/' ||
                this.location.path() === '/welcome'
              ) {
                App.exitApp();
              } else if (
                !(
                  this.location.path() === '/tabs/profile' ||
                  this.location.path() === '/tabs/home' ||
                  this.location.path() === '/tabs/notification' ||
                  this.location.path() === '/tabs/myRecords' ||
                  this.location.path() === '/tabs/message' ||
                  this.location.path() === '/tabs/apps'
                )
              ) {
                this.location.back();
              }
            } else if (
              this.location.path() === '' ||
              this.location.path() === '/' ||
              this.location.path() === '/welcome'
            ) {
              App.exitApp();
            } else {
              if (this.location.path() === '/loginPassword') {
                this.router.navigate(['loginSignup']);
              } else if (this.location.path() === '/loginSignup') {
                this.router.navigate(['invite']);
              } else if (this.location.path() === '/invite') {
                this.router.navigate(['welcome']);
              } else {
                this.location.back();
              }
            }
          });
        });
      }
    });
  }

  async initiateAutoLogin(hash) {
    await this.userService.getTokenByHashkey(hash).subscribe(async (res) => {
      const email = await this.storageService
        .getStorage('userEmail')
        .toPromise();
      this.storageService.getStorage('token').subscribe(async (token) => {
        this.storageService.setStorage('token', res).subscribe(async (res) => {
          this.userService.authorizeUser();
          const userEmail = res['email'] || email;
          await this.userService.fetchUserByEmailId(userEmail, 'false');
          this.storageService.setStorage('authType','magicLink')
         this.userSubscriber =await this.userService.user$.subscribe((user: User) => {
            this.user=user
            if (user) {
              this.userService
                .updateProfile(user['_id'], {
                  lastLoginTime: new Date(),
                })
                .subscribe(() => {
                  sessionStorage.setItem('authType', 'magicLink');
                  if (this.userSubscriber) {
                    this.userSubscriber.unsubscribe();
                  }
                  if (this.isAllDemographicsAvailable()) {
                    if (this.userSubscriber) {
                      this.userSubscriber.unsubscribe();
                    }
                    this.router.navigate(['/tabs/home']);
                  } else {
                    this.router.navigate(['/profile']);
                  }
                  
                });

            }
          });
        });
      });
    });
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
