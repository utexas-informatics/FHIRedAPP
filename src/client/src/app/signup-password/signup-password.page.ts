import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NewUser, User } from '../profile/user';
import { UserService } from '../profile/user.service';
import { StorageService } from '../storage.service';
import { ToastService } from '../utils/toast.service';

@Component({
  selector: 'app-signup-password',
  templateUrl: './signup-password.page.html',
  styleUrls: ['./signup-password.page.scss'],
})
export class SignupPasswordPage implements OnInit, OnDestroy {
  public signupInfo;
  public passwordType = 'password';
  public passwordIcon = 'eye-off';
  signupEmailSubscription: Subscription;
  userSubscription: Subscription;
  signupEmail;
  fromForgot;
  rePassword;
  placeholders = 'Password';
  passwordType1 = 'password';
  passwordIcon1;
  setPasswordEnable = true;
  public isIOS: boolean = true;

  constructor(
    private router: Router,
    private userService: UserService,
    private toastService: ToastService,
    private storageService: StorageService,
    private platform: Platform
  ) {
    if (
      (this.platform.is('ios') || this.platform.is('iphone')) &&
      this.platform.is('mobile')
    ) {
      this.isIOS = true;
    } else {
      //web application
      this.isIOS = false;
    }
    this.signupInfo = {};
  }

  ngOnInit() {
    this.signupEmailSubscription = this.userService.newUser$.subscribe(
      (newUser: NewUser) => {
        if (newUser) {
          this.signupEmail = newUser.email;
        }
      }
    );

    this.userService.forgot$.subscribe((forgot: boolean) => {
      if (forgot) {
        this.fromForgot = forgot;
        this.placeholders = 'Confirm Password';
      }
    });
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }
  hideShowPassword1() {
    this.passwordType1 = this.passwordType1 === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }
  validatePattern(passwordCtrl) {
    const lowercase = /[a-z]/g;
    const uppercase = /[A-Z]/g;
    if (
      passwordCtrl.control.errors &&
      lowercase.test(this.signupInfo.password)
    ) {
      passwordCtrl.control.errors.lowercase = true;
    }
    if (
      passwordCtrl.control.errors &&
      uppercase.test(this.signupInfo.password)
    ) {
      passwordCtrl.control.errors.uppercase = true;
    }
  }

  signup() {
    if (this.signupInfo.password != this.rePassword) {
      this.toastService.presentToast({
        type: 'warning',
        message: `password does not match.`,
      });
    } else if (
      this.signupInfo.password == '' &&
      this.signupEmail == '' &&
      this.rePassword == ''
    ) {
      this.toastService.presentToast({
        type: 'warning',
        message: `password can not be empty.`,
      });
    } else if (
      this.signupInfo.password == this.rePassword &&
      this.signupEmail
    ) {
      const encryptedUserCredentials = btoa(
        `${this.signupEmail}:${this.signupInfo.password}`
      );
      this.userService
        .signupUser(encryptedUserCredentials)
        .subscribe((res: User) => {
          if (res) {
            this.toastService.presentToastWithClose({
              type: 'success',
              message: `Registration successful. Please expect to hear back once you account is approved.`,
            });
            this.storageService.setStorage('userInfo', { isNewUser: false });
            this.router.navigate(['/loginSignup']);
          }
        });
    } else if (this.signupInfo.password && !this.signupEmail) {
      this.toastService.presentToast({
        type: 'warning',
        message: 'Please enter email',
      });
    }
  }
  setNewPassword() {
    if (this.signupInfo.password == this.rePassword) {
      if (this.signupEmail) {
        const encryptedUserCredentials = btoa(
          `${this.signupEmail}:${this.signupInfo.password}`
        );
        this.userService
          .setNewPassword(encryptedUserCredentials)
          .subscribe((res: User) => {
            if (res) {
              this.toastService.presentToast({
                type: 'success',
                message: `Password set successfully.`,
              });
              this.router.navigate(['/loginPassword']);
            }
          });
      }
    } else {
      this.toastService.presentToast({
        type: 'warning',
        message: 'Password does not match',
      });
    }
  }
  enableDisable() {
    if (this.rePassword.length > 7) {
      this.setPasswordEnable = false;
    } else this.setPasswordEnable = true;
  }

  ngOnDestroy() {
    if (this.signupEmailSubscription) {
      this.signupEmailSubscription.unsubscribe();
    }

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
  validate(signupForm) {
    if (signupForm.valid) {
      if (this.fromForgot) this.setNewPassword();
      else this.signup();
    } else {
      this.toastService.presentToast({
        type: 'warning',
        message: 'Password does not match given criteria',
      });
    }
  }
}
