import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from 'src/app/profile/user.service';
import { User } from 'src/app/profile/user';
import { AppsService } from '../apps.service';
import { App } from '../app';
import { ConsentComponent } from '../consent/consent.component';
import { apiAssetsBaseUrl } from '../../utils/constants';
import { StorageService } from '../../storage.service';
import { Subscription } from 'rxjs';
import { AuditService } from 'src/app/audit.service';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss'],
})
export class AppListComponent implements OnInit, OnDestroy {
  @Input() fromMyApps = false;
  @Input() labelAppList: string;
  @Input() allApps = [];
  @Input() user: User;
  selectedAll = false;
  userSubscription: Subscription;
  readonly apiAssetsBaseUrl = apiAssetsBaseUrl;
  options : InAppBrowserOptions = {
      location : 'no',//Or 'no' 
      hidden : 'no', //Or  'yes'
      zoom : 'yes',//Android only ,shows browser zoom controls 
      hideurlbar:'yes',//Or 'no'
  
};
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private iab: InAppBrowser,
    private appsService: AppsService,
    private userService: UserService,
    private storageService: StorageService,
    private auditService: AuditService,
    private platform: Platform
  ) {}

  ngOnInit() {}

  getSelectedApps() {
    return this.allApps.filter((app) => app.selected);
  }

  openAppDetails(event, appId) {
    this.router.navigate(['app-details', appId], {
      relativeTo: this.route,
    });
  }

  async openApp(event, app: App) {
    let url = app.appUrl;
    if (app._id === '5fec6f6e8048d25b1c189a2d') {
      url = `${app.appUrl}${this.user.zip}`;
      if(this.platform.is('ios')){
        
        let target = "_blank";
        this.iab.create(url,target,this.options);
      }else{
      this.appsService.setURL(url);
      this.router.navigate(['openapp'], {
        relativeTo: this.route,
      });
    }
    } else if (app._id === '5fec6f918048d25b1c189a2e') {
      const authType = sessionStorage.getItem('authType');
      const email = await this.storageService
        .getStorage('userEmail')
        .toPromise();
      this.storageService.getStorage('token').subscribe((token) => {
        if (
          token == '' ||
          (token == null && this.storageService.getToken() != null)
        ) {
          token = JSON.parse(this.storageService.getToken());
        }
        if (authType == 'magicLink') {
          url = `${app.appUrl}/${btoa(this.user._id).replace('=','')}/${btoa(
            token.refresh_token
          ).replace('=','')}?type=magicLink&email=${email}&isMobile=${this.appsService.isMobile()}`;
        } else {
          url = `${app.appUrl}/${btoa(this.user._id).replace('=','')}/${btoa(
            token.refresh_token
          ).replace('=','')}?isMobile=${this.appsService.isMobile()}`;
        }
        this.appsService.setURL(url);
        this.router.navigate(['openapp'], {
          relativeTo: this.route,
        });
      });
    }
  }

  async presentModal(app: App) {
    const modal = await this.modalController.create({
      component: ConsentComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        app,
      },
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.processModalData(dataReturned.data, app);
      }
    });
    return await modal.present();
  }
  processModalData(data, app) {
    if (data && data.isAccepted) {
      const requestPayload = {
        appId: app._id,
        consentedMedicalRecords: app.medicalRecords,
      };
      this.appsService
        .acceptConsent(this.user._id, requestPayload)
        .subscribe((_) => {
          this.appsService.setIsMyAppStatus(false);
          this.userService.fetchUserById(this.user._id);
        });
    } else {
      this.userSubscription = this.userService.user$.subscribe((user: User) => {
        if (user) {
          const auditInfo = {
            action: 'DeclineConsent',
            actionData: [{ name: 'patientId', value: user._id }],
            entity: 'user',
            change: [],
            createdBy: user._id,
          };
          this.auditService.generateAudit(auditInfo);
        }
      });
    }
  }

  selectAll() {
    this.allApps.forEach((app) => (app.selected = this.selectedAll));
  }

  isCheckboxSelected() {
    return this.allApps.some((item) => item.selected);
  }

  checkIfAllSelected() {
    this.selectedAll = this.allApps.every((item) => item.selected);
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
