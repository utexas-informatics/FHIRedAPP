import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../profile/user';
import { UserService } from '../profile/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TabService } from '../tabs/tab.service';
import { AppsService } from '../apps/apps.service';
import { App } from '../apps/app';
import { MyRecordsService } from '../my-records/myrecords.service';
import { StorageService } from '../storage.service';
import { ToastService } from '../utils/toast.service';
import { AuditService } from '../audit.service';
import { CookieService } from 'ngx-cookie-service';
import { Platform } from '@ionic/angular';
import {
  InAppBrowser,
  InAppBrowserOptions,
} from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  user: User;
  userSubscription: Subscription;
  headerProps: any;
  medicationProps: any;
  medication: any;
  plugin: any;
  allApps: App[] = [];
  appSubscriber: Subscription;
  recentMedicationSubscriber: Subscription;
  updateTokenSubscription: Subscription;
  dataLoaded: Boolean = false;
  isMatchProcess: any;
  subscriber: Subscription;
  options: InAppBrowserOptions = {
    location: 'no', //Or 'no'
    hidden: 'no', //Or  'yes'
    zoom: 'yes', //Android only ,shows browser zoom controls
    hideurlbar: 'yes', //Or 'no'
  };
  constructor(
    private userService: UserService,
    private tabService: TabService,
    private appsService: AppsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private myrecordsService: MyRecordsService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private toastService: ToastService,
    private auditService: AuditService,
    private platform: Platform,
    private iab: InAppBrowser
  ) {
    this.storageService.setStorage('userInfo', { isNewUser: false });
  }
  ngOnDestroy(): void {}

  ionViewWillEnter() {
    this.sendAudit(this.userService.getUser()._id);
    this.appSubscriber = this.appsService.getApps().subscribe((apps: App[]) => {
      this.allApps = apps.slice();
      this.processApps(this.allApps);
    });

    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = user;
        this.isMatchProcess =
          user && user.datavantMatchStatus === 'pending' ? false : true;
        if (
          this.isMatchProcess &&
          this.user.fhirPatientID == null &&
          user.datavantMatchStatus == 'matchFound'
        ) {
          // this.getFhiredAppPatientId();
          this.getRecentMedicalRecords();
        }
      }
    });
  }
  ngOnInit() {
    this.medication = [];
    this.medicationProps = [
      {
        type: 'Browse Medical Records',
        image_url: 'medical-records',
      },
      {
        type: 'Explore Apps',
        image_url: 'explore-auto-plugin',
      },
    ];

    this.plugin = [
      {
        title: 'Find Help',
        subTitle: 'Community Service',
        image: 'aunt-bertha',
      },
      {
        title: 'StudyApp',
        subTitle: 'Surveys in one place',
        image: 'study-app.svg',
      },
    ];
    this.appSubscriber = this.appsService.getApps().subscribe((apps: App[]) => {
      this.allApps = apps.slice();
      this.processApps(this.allApps);
    });

    this.headerProps = {
      showBackButton: false,
      title: `Good Morning`,
      placeholder: 'Search medications, records...',
      showSearchBar: true,
      medicalSearch: true,
    };

    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = { ...user };
        this.headerProps.title = `Good Morning, ${this.user.firstName}`;
      }
    });
  }

  getRecentMedicalRecords(fhirPatientID = '') {
    this.recentMedicationSubscriber = this.myrecordsService
      .fetchClinicalDataByCategory({
        pageCount: 5,
        offset: 0,
        categoryName: 'Medication',
        // globalPatientId: fhirPatientID,
        searchText: '',
      })
      .subscribe((resList: any) => {
        if (resList != null) {
          this.medication = [];
          this.parseRecentMedicalData(resList, 'medication');
          this.dataLoaded = true;
        }
        this.dataLoaded = true;
      });
  }
  sendAudit(userid) {
    const auditInfo = {
      action: 'PageVisits',
      actionData: [
        {
          name: 'page',
          value: 'home',
        },
      ],
      entity: 'visits',
      change: [],
      createdBy: userid,
    };
    this.auditService.generateAudit(auditInfo);
  }

  gotoMyrecords() {
    // this.tabService.setTabChange('myRecords');
    // let category = {
    //   description: 'Medication',
    //   type: 'Medication',
    // };
    // this.myrecordsService.setSelectedCategory(category);
    setTimeout(() => {
      this.tabService.setTabChange('myRecords');
      this.router.navigate(['/tabs/myRecords']);
    }, 100);
  }
  gotoAppPlugins() {
    this.tabService.setTabChange('apps');
    setTimeout(() => {
      this.router.navigate(['/tabs/apps']);
    }, 100);
  }

  ionViewWillLeave() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.recentMedicationSubscriber) {
      this.recentMedicationSubscriber.unsubscribe();
    }
    if (this.appSubscriber) this.appSubscriber.unsubscribe();

    if (this.subscriber) this.subscriber.unsubscribe();
  }

  onSearchTextChanged(searchText: string) {
    if (this.isMatchProcess) {
      var search = searchText.split(' | in ');
      let category = {
        description: search[1],
        type: search[1],
        searchText: search[0],
      };
      this.myrecordsService.setSelectedCategory(category);
      this.tabService.setTabChange('myRecords');
      setTimeout(() => {
        this.router.navigate(['/tabs/myRecords/my-records-category-list']);
      }, 300);
    } else {
      this.toastService.presentToastWithClose({
        type: 'info',
        message: 'Your new clinical data match process is in progress.',
      });
    }
  }
  openAppDetails(appId) {
    this.router.navigate(['tabs/apps/app-details', appId]);
  }

  detectChanges() {
    if (!(this.cdr as ViewRef).destroyed) {
      this.cdr.detectChanges();
    }
  }

  async openApp(event, app: App) {
    let url = app.appUrl;
    if (app._id === '5fec6f6e8048d25b1c189a2d') {
      url = `${app.appUrl}${this.user.zip}`;

      this.appsService.setURL(url);
      this.tabService.setTabChange('apps');
      if (this.platform.is('ios')) {
        let target = '_blank';
        this.iab.create(url, target, this.options);
      } else {
        this.router.navigate(['tabs/apps/openapp']);
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
          url = `${app.appUrl}/${btoa(this.user._id).replace('=', '')}/${btoa(
            token.refresh_token
          ).replace(
            '=',
            ''
          )}?type=magicLink&email=${email}&isMobile=${this.appsService.isMobile()}`;
        } else {
          url = `${app.appUrl}/${btoa(this.user._id).replace('=', '')}/${btoa(
            token.refresh_token
          ).replace('=', '')}?isMobile=${this.appsService.isMobile()}`;
        }
        this.appsService.setURL(url);
        this.tabService.setTabChange('apps');
        this.router.navigate(['tabs/apps/openapp']);
      });
    }
  }

  processApps(apps) {
    this.allApps = apps
      .filter(Boolean)
      .map((ap: App) => {
        return {
          ...ap,
          isConsented:
            this.user.apps.findIndex(
              (ua) => ua.app && ua.app._id === ap._id && ua.isActive
            ) > -1,
        };
      })
      .slice();
  }

  parseRecentMedicalData(responseList: any, category: string) {
    let recentmedicaiton = this.medication;
    switch (category) {
      case 'medication':
        {
          for (let i = 0; i < responseList.length; i++) {
            const entries = responseList[i]?.response?.entry;

            if (entries) {
              for (let j = 0; j < entries.length; j++) {
                const respObj = entries[j];
                const name =
                  respObj?.resource?.contained &&
                  respObj?.resource?.contained[0]?.code
                    ? respObj?.resource?.contained[0]?.code?.coding[0]?.display
                    : '';
                let dosage;
                let dateAdded;

                if (responseList[i]?.resourceName == 'MedicationDispense') {
                  dateAdded = respObj?.resource?.whenHandedOver
                    ? respObj?.resource?.whenHandedOver
                    : '';
                } else {
                  dateAdded =
                    respObj.resource?.extension &&
                    respObj.resource?.extension[5]?.valueDate
                      ? respObj.resource?.extension[5]?.valueDate
                      : '';
                }
                dosage =
                  respObj?.resource?.dosage &&
                  respObj?.resource?.dosage[0]?.text
                    ? respObj?.resource?.dosage[0]?.text
                    : '';
                if (name != '')
                  recentmedicaiton.push({
                    name: name.toLowerCase(),
                    dosage: dosage.toLowerCase(),
                    dateAdded: dateAdded,
                    category: responseList[i]?.resourceName,
                  });
              }
            }
            this.medication = recentmedicaiton;
          }
        }
        break;
    }
  }

  getFhiredAppPatientId() {
    this.subscriber = this.myrecordsService
      .fecthFhirPatientID({
        FHIRedAppPatientID: this.user._id,
      })
      .subscribe((response: any) => {
        if (response && response.fhiredPatientId) {
          const newUser = { ...this.user };
          newUser.fhirPatientID = response.fhiredPatientId;
          this.userService.setUser(newUser);
          this.getRecentMedicalRecords(newUser.fhirPatientID);
        }
      });
  }
}
