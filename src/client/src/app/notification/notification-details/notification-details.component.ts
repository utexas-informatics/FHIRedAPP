import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { NotificationService } from '../notification.service';
import { Notification } from '../notification';
import { User } from 'src/app/profile/user';
import { UserService } from 'src/app/profile/user.service';
import { switchMap, take } from 'rxjs/operators';
import { apiAssetsBaseUrl } from '../../utils/constants';
import { StorageService } from '../../storage.service';
import { App } from '../../apps/app';
import { AppsService } from '../../apps/apps.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.scss'],
})
export class NotificationDetailsComponent implements OnInit, OnDestroy {
  user: User;
  userSubscription: Subscription;
  getNotificationSubscription: Subscription;
  notification: Notification;
  readonly apiAssetsBaseUrl = apiAssetsBaseUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private appsService: AppsService,
    public navCtrl: NavController
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.userSubscription = this.userService.user$
        .pipe(take(1))
        .subscribe((user: User) => {
          if (user) {
            this.user = { ...user };
            this.getNotification(params.notificationId).subscribe((result) => {
              if (result) {
                this.userService.fetchUserById(this.user._id);
              }
            });
          }
        });
    });
  }

  openApp(apps) {
    let app = apps.app;
    let url = app.appUrl;
    if (app._id === '5fec6f918048d25b1c189a2e') {
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
          ).replace('=','')}?type=magicLink&email=${email}&studyId=${
            apps.meta.studyId
          }&surveyId=${apps.meta.surveyId}&isMobile=${this.appsService.isMobile()}`;
        } else {
          url = `${app.appUrl}/${btoa(this.user._id).replace('=','')}/${btoa(
            token.refresh_token
          ).replace('=','')}?studyId=${apps.meta.studyId}&surveyId=${apps.meta.surveyId}&isMobile=${this.appsService.isMobile()}`;
        }
        // this.iab.create(
        //   url,
        //   '_self',
        //   'hideurlbar=yes,hidenavigationbuttons=yes,zoom=no'
        // );

        this.appsService.setURL(url);
        this.router.navigate(['tabs/apps/openapp']);
      });
    }
  }

  getNotification(notificationId: string) {
    return this.notificationService.getNotification(notificationId).pipe(
      switchMap((notification: Notification) => {
        this.notification = { ...notification };
        const requestPayload = { notificationId };
        const userNotification = this.user.notifications.find(
          (n) => n.notification === notificationId
        );
        if (!userNotification.isRead) {
          return this.notificationService.markNotificationAsRead(
            this.user._id,
            requestPayload
          );
        }
        return of(false);
      })
    );
  }

  goBack() {
    this.navCtrl.pop();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.getNotificationSubscription) {
      this.getNotificationSubscription.unsubscribe();
    }
  }
}
