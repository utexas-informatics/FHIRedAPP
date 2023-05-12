import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { UserService } from 'src/app/profile/user.service';
import { CookieService } from 'ngx-cookie-service';
import { User } from 'src/app/profile/user';
import { AppsService } from '../apps.service';
import { ConsentComponent } from '../consent/consent.component';
import { App, MedicalRecord } from '../app';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { Subscription } from 'rxjs';
import { apiAssetsBaseUrl } from '../../utils/constants';
import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-app-details',
  templateUrl: './app-details.page.html',
  styleUrls: ['./app-details.page.scss'],
})
export class AppDetailsPage implements OnInit, OnDestroy {
  pathParams;
  isDescriptionCollapsed = true;
  isViewAllCollapsed = true;
  user: User;
  app: App;
  isConsented: boolean;
  userSubscription: Subscription;
  medicalRecords: MedicalRecord[];
  readonly apiAssetsBaseUrl = apiAssetsBaseUrl;
  options : InAppBrowserOptions = {
    location : 'no',//Or 'no' 
    hidden : 'no', //Or  'yes'
    zoom : 'yes',//Android only ,shows browser zoom controls 
    hideurlbar:'yes',//Or 'no'

};
  constructor(
    private route: ActivatedRoute,
    private modalController: ModalController,
    private appsService: AppsService,
    private userService: UserService,
    private iab: InAppBrowser,
    private router: Router,
    private storageService: StorageService,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.pathParams = { ...params };
    });
    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = { ...user };
        if (this.app) {
          this.performNextActions(this.app);
        } else {
          this.appsService
            .getApp(this.pathParams.appId)
            .subscribe((app: App) => {
              this.app = { ...app };
              this.performNextActions(app);
            });
        }
      }
    });
  }

  performNextActions(app) {
    this.isConsented =
      this.user.apps.findIndex((ua) => ua.app._id === app._id && ua.isActive) >
      -1;
  }

  openApp(event, app: App) {
    let url = app.appUrl;
    if (app._id === '5fec6f6e8048d25b1c189a2d') {
      url = `${app.appUrl}${this.user.zip}`;

      this.appsService.setURL(url);
     
      if(this.platform.is('ios')){
        let target = "_blank";
        this.iab.create(url,target,this.options);
      }else{
        this.router.navigate(['openapp'], {
          relativeTo: this.route,
        });
      }
    } else if (app._id === '5fec6f918048d25b1c189a2e') {
      this.storageService.getStorage('token').subscribe(async (token) => {
        if (
          token == '' ||
          (token == null && this.storageService.getToken() != null)
        ) {
          token = JSON.parse(this.storageService.getToken());
        }

        const authType = sessionStorage.getItem('authType');
        const email = await this.storageService
          .getStorage('userEmail')
          .toPromise();
        if (authType == 'magicLink') {
          url = `${app.appUrl}/${btoa(this.user._id).replace('=','')}/${btoa(
            token.refresh_token
          ).replace('=','')}?type=magicLink&email=${email}&isMobile=${this.appsService.isMobile()}`;
        } else {
          url = `${app.appUrl}/${btoa(this.user._id).replace('=','')}/${btoa(
            token.refresh_token
          ).replace('=','')}?isMobile=${this.appsService.isMobile()}`;
        }
        // this.iab.create(
        //   url,
        //   '_self',
        //   'hideurlbar=yes,hidenavigationbuttons=yes,zoom=no'
        // );
        this.appsService.setURL(url);
        this.router.navigate(['openapp'], {
          relativeTo: this.route,
        });
      });
    }
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ConsentComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        app: this.app,
      },
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.processModalData(dataReturned.data);
      }
    });
    return await modal.present();
  }

  processModalData(data) {
    if (data.isAccepted) {
      const requestPayload = {
        appId: this.app._id,
        consentedMedicalRecords: this.app.medicalRecords,
      };
      this.appsService
        .acceptConsent(this.user._id, requestPayload)
        .subscribe((_) => {
          this.userService.fetchUserById(this.user._id);
        });
    }
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
