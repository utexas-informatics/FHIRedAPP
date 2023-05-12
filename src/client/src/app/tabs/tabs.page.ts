import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ViewRef,
} from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { User } from '../profile/user';
import { UserService } from '../profile/user.service';
import { TabService } from './tab.service';
import { MessageService } from '../message/message.service';
import { PushNotificationService } from './../pushnotification.service';
import { AuditService } from '../audit.service';
import { skip } from 'rxjs/operators';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  auditAction: string;
  selectedTab = 'home';
  user: User;
  userSubscription: Subscription;
  messageSubscription: Subscription;
  notificationUnreadCount = 0;
  tabSubscription: Subscription;
  public messageCount;
  @ViewChild('tabs', { static: false }) tabs: IonTabs;

  constructor(
    private userService: UserService,
    private tabService: TabService,
    private messageService: MessageService,
    private pushNotificationService: PushNotificationService,
    private cdr: ChangeDetectorRef,
    private platform: Platform,
    private auditService: AuditService
  ) {}

  ngOnInit() {
    if (
      this.platform.is('android') ||
      this.platform.is('ios') ||
      this.platform.is('mobileweb')
    ) {
      this.auditAction = 'PatientOpenApp';
    }
    if (this.platform.is('desktop')) {
      this.auditAction = 'OpenWebApp';
    }
    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      if (user) {
        const auditInfo = {
          action: this.auditAction,
          actionData: [{ name: 'patientId', value: user._id }],
          entity: 'user',
          change: [],
          createdBy: user._id,
        };
        this.generateAudit(auditInfo);
        this.messageService.unreadCount(user._id);
        this.user = { ...user };
        this.notificationUnreadCount = user.notifications.filter(
          (n) => !n.isRead
        ).length;
        if(!this.pushNotificationService.IsPushRegistered())
        this.pushNotificationService.initPush(this.user);
      }
    });
    this.messageSubscription = this.messageService.count$.subscribe(
      (res: object) => {
        this.messageCount = res && res['count'] > 0 ? res['count'] : null;

        this.detectChanges();
      }
    );
    this.tabSubscription = this.tabService.tabChange$
      .pipe(skip(1))
      .subscribe((tabName: string) => {
        if (this.tabs != null) {
          this.tabs.select(tabName);
          this.selectedTab = tabName;
        }
      });
  }

  async generateAudit(auditInfo) {
    this.userService.isAppOpened$.subscribe((res) => {
      if (!res) {
        this.auditService.generateAudit(auditInfo);
        this.userService.setIsAppOpened(true);
      }
    });
  }
  detectChanges() {
    if (!(this.cdr as ViewRef).destroyed) {
      this.cdr.detectChanges();
    }
  }

  setCurrentTab() {
    this.selectedTab = this.tabs.getSelected();
  }

  ionViewWillLeave() {}

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.tabSubscription) {
      this.tabSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
