import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { User } from 'src/app/profile/user';
import { UserService } from 'src/app/profile/user.service';
import { AppsService } from '../apps.service';
import { ToastService } from '../../utils/toast.service';
import { StorageService } from 'src/app/storage.service';
import { App } from '../app';

@Component({
  selector: 'app-my-apps',
  templateUrl: './my-apps.page.html',
  styleUrls: ['./my-apps.page.scss'],
})
export class MyAppsPage implements OnInit, OnDestroy {
  @Input() myApps = [];
  @Input() isManageEnabled = false;
  @Input() user: User;
  routeParams;
  label = 'Manage';

  constructor(
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private appsService: AppsService,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.routeParams = { ...params };
    });
    this.label = 'Manage';
  }

  onManageClick(event, appList) {
    if (this.label === 'Manage') {
      this.label = 'Cancel';
    } else {
      this.resetActions(event, appList);
    }
  }

  resetActions(event, appList) {
    this.label = 'Manage';
    appList.selectedAll = false;
    appList.selectAll();
  }

  async getConfirmation(event, appList) {
    const selectedApps = appList.getSelectedApps();
    const confirm = await this.alertCtrl.create({
      cssClass: 'delete-alert-styles',
      header: `Remove ${selectedApps.length || 0} App(s)?`,
      message:
        'This will withdraw your consent and data access for this app. Continue?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Remove',
          cssClass: 'remove-btn-styles',
          handler: async () => {
            const requestPayload = { appIds: selectedApps.map((ap) => ap._id) };
            this.appsService
              .revokeConsent(this.user._id, requestPayload)
              .subscribe((_) => {
                this.appsService.setIsMyAppStatus(true);
                this.resetActions(event, appList);
                this.userService.fetchUserById(this.user._id);
                this.toastService.presentToastWithClose({
                  message:
                    'Consent and the access to your data is withdrawn successfully from this app.',
                });
              });
          },
        },
      ],
    });
    await confirm.present();
  }
  ngOnDestroy() {}
}
