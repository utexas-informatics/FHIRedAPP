import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { InviteCodeService } from '../invite.service';
import { ToastService } from '../../utils/toast.service';
import { cleanObject } from '../../utils';

@Component({
  selector: 'app-invite-code-add',
  templateUrl: './invite-code.component.html',
  styleUrls: ['./invite-code.component.scss'],
})
export class InviteCodeAddComponent implements OnInit, OnDestroy {
  public inviteInfo;
  inviteCodeSubscription: Subscription;

  constructor(
    private inviteCodeService: InviteCodeService,
    private toastService: ToastService
  ) {
    this.inviteInfo = {};
  }

  ngOnInit() {}

  submit(inviteForm) {
    this.inviteCodeSubscription = this.inviteCodeService
      .addInviteCode({ codes: [cleanObject({ ...this.inviteInfo })] })
      .subscribe((res) => {
        if (res) {
          this.toastService.presentToast({
            type: 'success',
            message: `Invite code added successfully for '${this.inviteInfo.patientEmail}'`,
          });
          inviteForm.reset();
          this.inviteInfo = {};
        }
      });
  }

  ngOnDestroy() {
    if (this.inviteCodeSubscription) {
      this.inviteCodeSubscription.unsubscribe();
    }
  }
}
