import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { of, Subscription, throwError } from 'rxjs';
import { InviteCodeService } from './invite.service';
import { ToastService } from '../utils/toast.service';
import { catchError, switchMap } from 'rxjs/operators';
import { StorageService } from '../storage.service';
import { Platform } from '@ionic/angular';
@Component({
  selector: 'app-invite',
  templateUrl: './invite.page.html',
  styleUrls: ['./invite.page.scss'],
})
export class InvitePage implements OnInit, OnDestroy {
  getInviteCodeStatusSubscription: Subscription;
  public isIOS: boolean;
  public otp;
  public passwordType = 'number';

  constructor(
    private router: Router,
    private inviteCodeService: InviteCodeService,
    private toastService: ToastService,
    private storageService: StorageService,
    private platform: Platform
  ) {
    this.otp = {
      first: '',
      second: '',
      third: '',
      forth: '',
      fifth: '',
      sixth: '',
    };
  }
  ngOnInit() {
    this.storageService.setStorage('openOnce', { openOnce: true });
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
    this.otp = {
      first: '',
      second: '',
      third: '',
      forth: '',
      fifth: '',
      sixth: '',
    };
  }

  onVerify() {
    if (!this.allVerifyCode()) {
      this.getInviteCodeStatusSubscription = this.inviteCodeService
        .getStatus(
          `${this.otp.first}${this.otp.second}${this.otp.third}${this.otp.forth}${this.otp.fifth}${this.otp.sixth}`.toLowerCase()
        )
        .pipe(
          switchMap((response) => {
            if (response === 'expired') {
              this.toastService.presentToast({
                type: 'warning',
                message:
                  'This invite code is either invalid or has already been used. Please contact Study Coordinator for further help.',
              });
              return of(false);
            }

            if (response === 'Active') {
              // update status to verified
              return this.inviteCodeService.update(
                `${this.otp.first}${this.otp.second}${this.otp.third}${this.otp.forth}${this.otp.fifth}${this.otp.sixth}`.toLowerCase(),
                {
                  status: 'Verified',
                }
              );
            } else if (response === 'Inactive') {
              this.toastService.presentToastWithClose({
                type: 'warning',
                message:
                  'This invite code is either invalid or has already been used. Please contact Study Coordinator for further help.',
              });
              return of(false);
            } else if (response !== 'Active' && response !== 'Verified') {
              this.toastService.presentToastWithClose({
                type: 'warning',
                message:
                  'This invite code is either invalid or has already been used. Please contact Study Coordinator for further help.',
              });
              return of(false);
            } else {
              return of(true);
            }
          })
         )
        .subscribe((response) => {
          if (response === true) {
            this.router.navigate([
              '/consent',
              `${this.otp.first}${this.otp.second}${this.otp.third}${this.otp.forth}${this.otp.fifth}${this.otp.sixth}`.toLowerCase(),
            ]);
          }
        });
    } else {
      this.toastService.presentToastWithClose({
        type: 'warning',
        message: 'Invite code cannot be empty',
      });
    }
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

  allVerifyCode() {
    return !(
      this.otp.first != '' &&
      this.otp.second != '' &&
      this.otp.third != '' &&
      this.otp.forth != '' &&
      this.otp.fifth != '' &&
      this.otp.sixth != ''
    );
  }

  ionViewWillLeave() {
    this.otp = {
      first: '',
      second: '',
      third: '',
      forth: '',
      fifth: '',
      sixth: '',
    };
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'string' ? 'password' : 'string';
  }

  autoTrigger() {
    if (!this.allVerifyCode()) {
      this.onVerify();
    }
  }

  ngOnDestroy() {
    if (this.getInviteCodeStatusSubscription) {
      this.getInviteCodeStatusSubscription.unsubscribe();
    }
  }
}
