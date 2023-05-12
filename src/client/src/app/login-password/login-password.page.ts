import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription, timer } from 'rxjs';
import { skip, switchMap, scan, takeWhile } from 'rxjs/operators';
import { NewUser, User } from '../profile/user';
import { UserService } from '../profile/user.service';
import { StorageService } from '../storage.service';
import { ToastService } from '../utils/toast.service';
import { BiometricService } from '../biometric.service';
import { Platform } from '@ionic/angular';
import jwt_decode from 'jwt-decode';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';

@Component({
  selector: 'app-login-password',
  templateUrl: './login-password.page.html',
  styleUrls: ['./login-password.page.scss'],
})
export class LoginPasswordPage implements OnInit {
  user: User;
  public loginInfo;
  public autoLoginInfo;
  public passwordType = 'password';
  public passwordIcon = 'eye-off';
  userSubscription: Subscription;
  signupEmailSubscription: Subscription;
  loginSubscription: Subscription;
  updateProfileSubscription: Subscription;
  loginWithEmailLinkSubscription: Subscription;
  showBiometric = false;
  showLoginWihEmail = false;
  isCoordinator = false;
  disable = false;
  timer$: Observable<number>;
  duration = 300;
  magicLinkEmail = '';
  public isIOS: boolean = true;
  loginResponse: boolean = true;
  loginResponseReceived: Subscription;
  isBiometricAvailable: boolean;
  userBioMetrciSetting: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private storageService: StorageService,
    private toastService: ToastService,
    private biometricService: BiometricService,
    private platform: Platform,
    private faio: FingerprintAIO
  ) {
    this.loginInfo = {};
    this.autoLoginInfo = {};
    if (
      (this.platform.is('ios') || this.platform.is('iphone')) &&
      this.platform.is('mobile')
    ) {
      this.isIOS = true;
    } else {
      //web application
      this.isIOS = false;
    }
    this.userService.setLoggedOut(false);
  }

  async displayBiometric() {
    const token = await this.storageService.getStorage('token').toPromise();
    this.userBioMetrciSetting = await this.storageService
      .getStorage('userBioMetrciSetting')
      .toPromise();
    this.isBiometricAvailable = await this.faio.isAvailable();
    if (token) {
      this.showBiometric =
        this.isBiometricAvailable &&
        (this.userBioMetrciSetting == 'yes' ? true : false) &&
        sessionStorage.getItem('userEmail') ===
          atob(await this.storageService.getStorage('key').toPromise()).split(
            ':'
          )[0] &&
        jwt_decode(token.access_token)['email'] ===
          sessionStorage.getItem('userEmail')
          ? true
          : false;
    } else {
      this.showBiometric = false;
    }
    if (this.showBiometric && !this.userService.getLoggedOut()) {
      this.openFingerprint();
    }
  }

  ionViewWillEnter() {
    this.setEmail();
    this.magicLinkEmail = sessionStorage.getItem('userEmail');
    this.loginInfo.password = '';
    if (
      this.router.url.includes('inviteCodeAdd') ||
      this.router.url.includes('signupActivate')
    ) {
      this.showBiometric = false;
      this.isCoordinator = true;
    }

    if (
      (this.platform.is('android') ||
        this.platform.is('ios') ||
        this.platform.is('iphone')) &&
      this.platform.is('mobile') &&
      !this.platform.is('mobileweb')
    ) {
      this.displayBiometric();
      this.showLoginWihEmail = true;
    } else {
      this.showBiometric = false;
    }

    this.userSubscription = this.userService.user$
      .pipe(skip(1))
      .subscribe((user: User) => {
        this.user = { ...user };
        const lastSnapshot = this.route.snapshot.paramMap.get('previousUrl');
        if (
          lastSnapshot &&
          (lastSnapshot.includes('signupActivate') ||
            lastSnapshot.includes('/invite/inviteCodeAdd'))
        ) {
          if (
            this.user &&
            this.user.role &&
            this.user.role._id &&
            this.user.role._id === '60653ffa4206150ec061d0cb'
          ) {
            this.router.navigate([`${lastSnapshot}`]);
          } else {
            this.toastService.presentToastWithClose({
              type: 'error',
              message:
                'Invalid role access to activate user. Please contact Study Coordinator for further help.',
            });
          }
        } else if (user) {
          // capture login time
          this.updateProfileSubscription = this.userService
            .updateProfile(this.user._id, { lastLoginTime: new Date() })
            .subscribe();
          if (this.isAllDemographicsAvailable()) {
            this.router.navigate(['/tabs/home']);
          } else {
            this.router.navigate(['/profile']);
          }
        }
      });

    this.signupEmailSubscription = this.userService.newUser$.subscribe(
      (res: NewUser) => {
        if (res && res.email) {
          this.loginInfo.email = res.email;
        }
      }
    );

    this.loginResponseReceived = this.userService.IsloginResponse$.subscribe(
      (res: any) => {
        if (res != null) this.loginResponse = res.isLogin;
      }
    );
  }
  async notExpired() {
    const token = await this.storageService.getStorage('token').toPromise();

    var exp = jwt_decode(token.refresh_token)['exp'];
    return Date.now() < exp * 1000 && (await this.faio.isAvailable()) != '';
  }

  async openFingerprint() {
    const token = await this.storageService.getStorage('token').toPromise();
    
    if (token && token['refresh_token'] && (await this.notExpired())) {
      this.biometricService.showBiometric();
    } else {
      let userCreds = atob(
        await this.storageService.getStorage('key').toPromise()
      ).split(':');
      this.faio.show({ disableBackup: false }).then((result) => {
        this.autoLoginInfo.email = userCreds[0];
        this.autoLoginInfo.password = userCreds[1];
        this.autoLogin();
      });
    }
  }

  ngOnInit() {}

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

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  logoutBeforeLogin() {
    if (this.showBiometric) {
      this.userService.logout().subscribe((res) => {
        if (res) {
          sessionStorage.clear();
          this.storageService.removeStorage('token');
          this.userService.unAuthorizeUser();
          this.storageService.removeStorage('userInfo');
          this.storageService.removeStorage('authType');
          this.login();
        }
      });
    } else {
      this.login();
    }
  }
  async login() {
    await this.userService.loading();

    (document.activeElement as HTMLElement).blur();
    this.loginResponse = false;
    if (this.loginInfo.email && this.loginInfo.password) {
      const encryptedUserCredentials = btoa(
        `${this.loginInfo.email}:${this.loginInfo.password}`
      );
      this.loginSubscription = this.userService
        .login(encryptedUserCredentials)
        .pipe(switchMap((res) => this.storageService.setStorage('token', res)))
        .subscribe((lres) => {
          sessionStorage.removeItem('authType');
          this.storageService.setStorage(
            'userBioMetrciSetting',
            this.isBiometricAvailable ? 'yes' : ''
          );
          this.storageService.setStorage('authType', 'normalLogin');
          sessionStorage.setItem('userEmail', this.loginInfo.email);
          this.storageService.setStorage('userEmail', this.loginInfo.email);
          this.userService.authorizeUser();
          this.userService.fetchUserByEmailId(
            this.loginInfo.email,

            'false',
            this.loginInfo.password
          );
          this.loginResponse = true;
        });
    }
  }
  async autoLogin() {
    if (this.autoLoginInfo.email && this.autoLoginInfo.password) {
      await this.userService.loading();
      const encryptedUserCredentials = btoa(
        `${this.autoLoginInfo.email}:${this.autoLoginInfo.password}`
      );
      this.loginSubscription = this.userService
        .login(encryptedUserCredentials)
        .pipe(switchMap((res) => this.storageService.setStorage('token', res)))
        .subscribe((lres) => {
          sessionStorage.removeItem('authType');
          this.storageService.setStorage('authType', 'normalLogin');
          this.userService.authorizeUser();
          // this.storageService.setStorage('token', res)
          this.userService.fetchUserByEmailId(
            this.autoLoginInfo.email,

            'false',
            this.autoLoginInfo.password
          );
        });
    }
  }

  forgotPassword() {
    this.userService.setNewUser({ email: this.loginInfo.email });
    this.userService.setForgot(true);

    this.router.navigate(['/emailVerification']);
  }

  loginWithMagicLink() {
    if (this.loginInfo.email) {
      if (
        this.loginInfo?.email != '' &&
        this.loginInfo?.email.includes('@') &&
        this.loginInfo?.email.includes('.')
      ) {
        sessionStorage.setItem('userEmail', this.loginInfo.email);
      }
    }
    this.magicLinkEmail = sessionStorage.getItem('userEmail');

    this.loginWithEmailLinkSubscription = this.userService
      .loginWithMagicLink()
      .subscribe((result) => {
        // this.storageService.removeStorage('token');
        this.timeOut();
      });
  }
  startTimer(duration = 300) {
    return timer(0, 1000).pipe(
      scan((acc) => --acc, duration),
      takeWhile((x) => x >= 0)
    );
  }
  timeOut() {
    this.disable = true;
    this.timer$ = this.startTimer(this.duration);
    this.timer$.subscribe((val) => {
      if (val < 1) this.disable = false;
    });
  }

  disableMagicLinkButton() {
    if (this.loginInfo.email && this.loginInfo?.email != '') {
      return !(
        this.loginInfo?.email != '' &&
        this.loginInfo?.email?.includes('@') &&
        this.loginInfo?.email?.includes('.')
      );
    }
    return true;
  }

  validateLogin() {
    if (this.loginInfo.email && this.loginInfo.password && this.loginResponse) {
      this.login();
    } else {
      this.toastService.presentToast({
        type: 'warning',
        message: 'Username or password is empty',
      });
    }
  }
  async setEmail() {
    this.loginInfo = {
      email: await this.storageService.getStorage('userEmail').toPromise(),
    };
  }

  ionViewWillLeave() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.signupEmailSubscription) {
      this.signupEmailSubscription.unsubscribe();
    }
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
    if (this.updateProfileSubscription) {
      this.updateProfileSubscription.unsubscribe();
    }
    if (this.loginWithEmailLinkSubscription) {
      this.loginWithEmailLinkSubscription.unsubscribe();
    }
    if (this.loginResponseReceived) {
      this.loginResponseReceived.unsubscribe();
    }
  }
}
