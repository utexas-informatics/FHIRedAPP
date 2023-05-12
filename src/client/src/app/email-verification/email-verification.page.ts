import { Component, OnInit } from '@angular/core';
import { Observable, Subscription, timer } from 'rxjs';
import { UserService } from '../profile/user.service';
import { Router } from '@angular/router';
import { NewUser } from '../profile/user';
import { EmailVerificationCodeService } from './email-verification.service';
import { count, scan, takeWhile } from 'rxjs/operators';
import { ToastService } from '../utils/toast.service';
import { ThrowStmt } from '@angular/compiler';
import { FormGroup } from '@angular/forms';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.page.html',
  styleUrls: ['./email-verification.page.scss'],
})
export class EmailVerificationPage implements OnInit {
  public otp;
  newUserSubscription: Subscription;
  verifyEVCSubscription: Subscription;
  public passwordType = 'number';
  signupUser;
  duration = 180;
  timer$: Observable<number>;
  timeRemaining = 0;
  disable = true;
  fromForgot = false;
  verification = false;
  public isIOS: boolean = true;

  constructor(
    private router: Router,
    private userService: UserService,
    private emailVerificationCodeService: EmailVerificationCodeService,
    private toastService: ToastService,
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
    this.otp = {
      first: '',
      second: '',
      third: '',
      forth: '',
      fifth: '',
      sixth: '',
    };
  }

  ngOnInit() {}

  hideShowPassword() {
    this.passwordType = this.passwordType === 'tel' ? 'password' : 'tel';
  }

  startTimer(duration = 180) {
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

  otpController(event, next, prev) {
    if (event.target.value.length < 1 && prev) {
      prev.setFocus();
    } else if (next && event.target.value.length > 0) {
      next.setFocus();
    } else {
      return 0;
    }
  }

  onNext() {
    if (this.signupUser.email) {
      this.verifyEVCSubscription = this.emailVerificationCodeService
        .verifyEmailVerificationCode({
          email: this.signupUser.email,
          code: `${this.otp.first}${this.otp.second}${this.otp.third}${this.otp.forth}${this.otp.fifth}${this.otp.sixth}`,
        })
        .subscribe((response) => {
          if (response) {
            this.router.navigate(['/signupPassword']);
          }
        });
    }
  }

  onGenerate() {
    if (!this.fromForgot) {
      this.userService.verifyUser(this.signupUser.email);
      this.toastService.presentToast({
        message: `New verification code sent to '${this.signupUser.email}'`,
      });
    } else {
      if (this.signupUser.email && this.signupUser.email != '') {
        this.userService
          .verifyAndSendForgot(this.signupUser.email)
          .subscribe((res) => {
            if (res) {
              this.verification = true;
              this.userService.setNewUser({ email: this.signupUser.email });
              this.toastService.presentToast({
                message: `New verification code sent to '${this.signupUser.email}'`,
              });
            }
          });
      } else {
        this.toastService.presentToast({
          message: `Email field is empty`,
        });
      }
    }

    this.otp.first = '';
    this.otp.second = '';
    this.otp.third = '';
    this.otp.forth = '';
    this.otp.fifth = '';
    this.otp.sixth = '';
    this.timeOut();
  }

  ionViewWillEnter() {
    this.newUserSubscription = this.userService.newUser$.subscribe(
      (user: NewUser) => {
        if (user) {
          this.signupUser = { ...user };
        }
      }
    );

    this.newUserSubscription = this.userService.forgot$.subscribe(
      (forgot: boolean) => {
        if (forgot) {
          this.fromForgot = forgot;
        }
      }
    );

    if (!this.fromForgot) {
      this.timeOut();
      this.verification = true;
    }
  }

  ionViewWillLeave() {
    if (this.newUserSubscription) {
      this.newUserSubscription.unsubscribe();
    }
  }
  verify() {
    if (
      this.otp.first != '' &&
      this.otp.second != '' &&
      this.otp.third != '' &&
      this.otp.forth != '' &&
      this.otp.fifth != '' &&
      this.otp.sixth != ''
    ) {
      return false;
    }
    return true;
  }
  autoTrigger() {
    if (!this.verify()) {
      this.onNext();
    }
  }
}
