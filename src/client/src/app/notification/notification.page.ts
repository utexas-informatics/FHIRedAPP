import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { IonInfiniteScroll } from '@ionic/angular';

import { Notification } from './notification';
import { NotificationService } from './notification.service';
import { UserService } from '../profile/user.service';
import { User } from '../profile/user';
import { AuditService } from '../audit.service';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  user: User;
  page = 0;
  notifications: Notification[] = [];
  recentNotifications: Notification[] = [];
  earlierNotifications: Notification[] = [];
  getNotificationsSubscription: Subscription;
  userSubscription: Subscription;
  pullToRefreshEvent;
  public headerProps: object;
  loaded = false;
  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private auditService: AuditService
  ) {
    this.headerProps = {
      showBackButton: false,
      title: 'Your Notifications',
      placeholder: 'Search Threads',
      // showSearchBar: false,
    };
  }

  sendAudit() {
    const auditInfo = {
      action: 'PageVisits',
      actionData: [
        {
          name: 'page',
          value: 'notifications',
        },
      ],
      entity: 'visits',
      change: [],
      createdBy: this.userService.getUser()._id,
    };
    this.auditService.generateAudit(auditInfo);
  }
  ionViewWillEnter() {
    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = { ...user };
      }
    });
    this.sendAudit();
  }
  ngOnInit() {
    this.loaded = false;
    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = { ...user };
        this.resetData();
        this.getNotifications();
      }
    });
  }

  resetData() {
    this.notifications = [];
    this.recentNotifications = [];
    this.earlierNotifications = [];
    this.page = 0;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    if (this.pullToRefreshEvent && this.pullToRefreshEvent.target) {
      this.pullToRefreshEvent.target.complete();
    }
    this.pullToRefreshEvent = null;
  }

  getNotifications(event?: any): void {
    this.getNotificationsSubscription = this.notificationService
      .getNotifications(this.user._id, this.page)
      .pipe(
        map((results) =>
          results.sort(
            (a: Notification, b: Notification) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        )
      )
      .subscribe((notifications: Notification[]) => {
        this.notifications = this.notifications.concat(notifications.slice());
        this.processNotifications();
        if (event) {
          event.target.complete();
        }
        // disable the infinite scroll at the end of data
        if (
          this.notifications.length >= this.user.notifications.length &&
          this.infiniteScroll
        ) {
          this.infiniteScroll.disabled = true;
        }
        this.page += 1;
        this.loaded = true;
      });
  }

  processNotifications() {
    this.recentNotifications = [];
    this.earlierNotifications = [];
    this.notifications.forEach((n) => {
      if (
        moment()
          .startOf('day')
          .diff(moment(n.createdAt).startOf('day'), 'days') <= 4
      ) {
        this.recentNotifications.push({ ...n });
      } else {
        this.earlierNotifications.push({ ...n });
      }
    });
  }

  doRefresh(event) {
    this.loaded = false;
    this.pullToRefreshEvent = event;
    this.userService.fetchUserById(this.user._id);
  }

  loadData(event) {
    this.getNotifications(event);
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.getNotificationsSubscription) {
      this.getNotificationsSubscription.unsubscribe();
    }
  }
}
