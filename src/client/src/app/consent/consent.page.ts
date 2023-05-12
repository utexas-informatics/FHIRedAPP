import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AppService } from '../app.service';
import { ToastService } from '../utils/toast.service';
import { InviteCodeService } from '../invite/invite.service';
import { StorageService } from '../storage.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-consent',
  templateUrl: './consent.page.html',
  styleUrls: ['./consent.page.scss'],
})
export class ConsentPage implements OnInit, OnDestroy {
  isConsentPolicyCollapsed = false;
  consentPolicyResp: any = { consentPolicy_en: '', consentPolicy_sp: '' };
  getLeapConsentPolicySubscription: Subscription;
  getInviteCodeStatusSubscription: Subscription;
  code: string;
  isEngLanguageSelected: any = true;
  consentLoading: Boolean = false;
  consentPolicyTobeLoaded: any = '';
  public isIOS: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appService: AppService,
    private toastService: ToastService,
    private inviteCodeService: InviteCodeService,
    private storageService: StorageService,
    private platform: Platform
  ) {
    // this.consentPolicy = '';
  }

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
    this.route.params.subscribe((params) => {
      if (params) {
        this.code = params.code;
      }
    });

    this.getLeapConsentPolicySubscription = this.appService
      .getLeapConsentPolicy()
      .subscribe((response) => {
        this.consentPolicyResp = response;
        this.consentPolicyTobeLoaded = this.isEngLanguageSelected
          ? this.consentPolicyResp.consentPolicy_en
          : this.consentPolicyResp.consentPolicy_sp;

        this.consentLoading = true;
      });
  }

  onAccept() {
    this.getInviteCodeStatusSubscription = this.inviteCodeService
      .update(this.code, { status: 'ConsentAccepted' })
      .subscribe((response) => {
        if (response === true) {
          this.toastService.presentToastWithClose({
            message: 'Thank you, your response is recorded',
          });
          this.router.navigate(['/loginSignup']);
        }
      });
  }

  onDecline() {
    this.inviteCodeService.updateDeclineStatus(this.code);
    this.toastService.presentToastWithClose({
      message: 'Thank you, your response is recorded',
    });
    this.router.navigate(['/invite']);
  }
  setSelected() {
    this.isEngLanguageSelected = !this.isEngLanguageSelected;
    this.consentPolicyTobeLoaded = this.isEngLanguageSelected
      ? this.consentPolicyResp.consentPolicy_en
      : this.consentPolicyResp.consentPolicy_sp;
  }

  ngOnDestroy() {
    if (this.getLeapConsentPolicySubscription) {
      this.getLeapConsentPolicySubscription.unsubscribe();
    }
    if (this.getInviteCodeStatusSubscription) {
      this.getInviteCodeStatusSubscription.unsubscribe();
    }
  }
}
