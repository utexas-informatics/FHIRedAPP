import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuditService } from '../audit.service';
import { User } from '../profile/user';
import { UserService } from '../profile/user.service';
import { App } from './app';
import { AppsService } from './apps.service';

@Component({
  selector: 'app-apps',
  templateUrl: './apps.page.html',
  styleUrls: ['./apps.page.scss'],
})
export class AppsPage implements OnInit, OnDestroy {
  apps: App[] = [];
  allApps: App[] = [];
  myApps = false;
  user: User;
  isMyAppsEnabled = false;
  isManageEnabled = false;
  userSubscription: Subscription;
  public headerProps: object;

  constructor(
    private userService: UserService,
    private appsService: AppsService,
    private auditService: AuditService
  ) {
    this.headerProps = {
      showBackButton: false,
      title: 'My Apps',
      placeholder: 'Search Threads',
      showSearchBar: false,
    };
  }
  ionViewWillEnter() {
    this.sendAudit();
  }

  sendAudit() {
    const auditInfo = {
      action: 'PageVisits',
      actionData: [
        {
          name: 'page',
          value: 'apps-list',
        },
      ],
      entity: 'visits',
      change: [],
      createdBy: this.userService.getUser()._id,
    };
    this.auditService.generateAudit(auditInfo);
  }

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = { ...user };
        this.isMyAppsEnabled = user.apps && user.apps.length > 0;
        this.isManageEnabled =
          user.apps && user.apps.findIndex((a) => a.app && a.isActive) > -1;
        this.appsService.getIsMyAppStatus$().subscribe((flag) => {
          this.fetchApps(flag);
        });
      }
    });
  }

  fetchApps(myApps) {
    this.myApps = myApps;
    if (this.myApps) {
      this.apps = this.user.apps
        .filter((app) => app.isActive)
        .map((a) => a.app)
        .filter(Boolean);
      this.processApps(this.apps);
    } else if (this.allApps.length) {
      this.processApps(this.allApps);
    } else {
      // fetch all apps
      this.appsService.getApps().subscribe((apps: App[]) => {
        this.allApps = apps.slice();
        this.processApps(apps);
      });
    }
  }

  processApps(apps) {
    this.apps = apps
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

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
