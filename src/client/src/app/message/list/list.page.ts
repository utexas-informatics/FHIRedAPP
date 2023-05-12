import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ViewRef,
} from '@angular/core';
import { MessageService } from '../message.service';
import { ToastService } from '../../utils/toast.service';
import { IonInfiniteScroll } from '@ionic/angular';
import { UserService } from '../../profile/user.service';
import { Subscription } from 'rxjs';
import { skip, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from 'src/app/profile/user';
import { AuditService } from 'src/app/audit.service';
@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  public headerProps: object;
  public listPayload: any;
  public threadList: any;
  public isLoad: boolean;
  public isHeader;
  public appList: any;
  public currentEvent: any;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  activeUser: object;
  messageSubscription: Subscription;
  participantsSubscription: Subscription;
  appListSubscription: Subscription;
  userSubscription: Subscription;
  searchText: String;
  selectedFilter: object;
  isUser: boolean;
  constructor(
    private messageService: MessageService,
    private toastService: ToastService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auditService: AuditService
  ) {
    this.headerProps = {
      showBackButton: false,
      title: 'Your Messages',
      placeholder: 'Search Threads',
      showSearchBar: true,
    };
  }

  ngOnInit() {
    this.messageSubscription = this.messageService.notifyMessage$
      .pipe(skip(1))
      .subscribe((res: object) => {
        this.getThreads(false);
        this.detectChanges();
      });
  }

  detectChanges() {
    if (!(this.cdr as ViewRef).destroyed) {
      this.cdr.detectChanges();
    }
  }

  ionViewWillEnter() {
    this.isHeader = false;

    setTimeout(() => {
      this.isHeader = true;
    }, 100);

    this.listPayload = [];
    this.threadList = [];
    this.selectedFilter = {};
    this.activeUser = this.userService.activeUser;
    // TBD : remove below line
    // this.activeUser = { _id: '5ff40edee62fe27178eab165' };
    if (this.activeUser && this.activeUser['_id']) {
      this.getThreads();
      this.getAppList();
      this.messageService.unreadCount(this.activeUser['_id']);
    } else {
      this.toastService.presentToast({
        message: `The User details not found`,
      });
      this.userService.unAuthorizeUser();
      this.router.navigate(['/loginPassword']);
    }
    this.sendAudit();
  }
  sendAudit() {
    const auditInfo = {
      action: 'PageVisits',
      actionData: [
        {
          name: 'page',
          value: 'message-list',
        },
      ],
      entity: 'visits',
      change: [],
      createdBy: this.userService.getUser()._id,
    };
    this.auditService.generateAudit(auditInfo);
  }
  getAppList() {
    this.appList = [];
    this.appListSubscription = this.messageService
      .getAppList()
      .subscribe((res) => {
        this.appList = res;
        this.userSubscription = this.userService.user$.subscribe((ures) => {
          if (ures && this.appList) {
            ures.apps.map((x) => {
              this.appList.forEach((y) => {
                if (x.app._id == y._id) {
                  y.isConsented = x.isActive;
                }
              });
            });
          }
        });
      });
  }

  getThreads(init = true) {
    if (init) {
      this.listPayload = [];
      this.isLoad = true;
    }
    this.threadList = [];
    this.messageSubscription = this.messageService
      .geThreads(
        this.activeUser['_id'],
        this.threadList.length,
        this.selectedFilter['_id']
      )
      .subscribe(
        (threadList) => {
          this.threadList = this.threadList.concat(threadList);
          this.isLoad = false;
          const isRefresh = !init ? 'isRefresh' : null;
          this.buildPayload(threadList, isRefresh);
        },
        () => {
          this.isLoad = false;
        }
      );
  }

  buildPayload(list, isRefresh) {
    this.listPayload = isRefresh ? [] : this.listPayload;
    const updatedList = list.map((item: any) => {
      const chats = item.chats.length ? item.chats : null;
      return {
        id: item._id,
        title: item.title,
        appName: item.app.appName,
        appIcon:
          item.app._id === '5fec6f918048d25b1c189a2e'
            ? 'study-app-sm'
            : 'aunt-bertha-sm',
        content: chats
          ? `${chats[0].sender.name} : ${chats[0].body}`
          : `You don't have any new message from ${
              item.participants &&
              item.participants.sender &&
              item.participants.sender.name
                ? item.participants.sender.name
                : 'unknown user'
            }`,
        date: chats ? chats[0].postedAt : '',
        slider: [{ name: 'Read' }],
        isSlide: false,
        borderClass: item.unreadCount ? 'unread-card' : 'read-card',
        unreadCount: item.unreadCount + ' unread messages',
      };
    });
    this.listPayload = this.listPayload.concat(updatedList);
    this.detectChanges();
  }

  doRefresh(event) {
    this.isHeader = false;
    setTimeout(() => {
      this.isHeader = true;
    }, 1);
    if (this.activeUser && !this.activeUser['_id']) {
      this.toastService.presentToast({
        message: `The User details not found`,
      });
      event.target.complete();
      return;
    }
    this.infiniteScroll.disabled = false;
    this.messageSubscription = this.messageService
      .geThreads(this.activeUser['_id'], 0, this.selectedFilter['_id'])
      .subscribe((threadList) => {
        this.threadList = threadList;
        this.buildPayload(this.threadList, 'refresh');
        event.target.complete();
      });
  }

  loadData(event) {
    this.currentEvent = event;
    let getThreadAPI;
    if (this.searchText) {
      getThreadAPI = this.messageService.searchThreads(
        this.searchText,
        this.activeUser['_id'],
        this.threadList.length,
        this.selectedFilter['_id']
      );
    } else {
      getThreadAPI = this.messageService.geThreads(
        this.activeUser['_id'],
        this.threadList.length,
        this.selectedFilter['_id']
      );
    }
    this.messageSubscription = getThreadAPI.subscribe((threadList) => {
      this.threadList = this.threadList.concat(threadList);
      this.buildPayload(threadList, null);
      event.target.complete();
      if (threadList && !threadList.length) {
        // this.toastService.presentToast({
        //   message: `We don't have any more message threads `,
        // });
        event.target.disabled = true;
      }
    });
  }

  onSearchTextChanged(searchText) {
    if (this.currentEvent) {
      this.currentEvent.target.disabled = false;
    }
    this.threadList = [];
    this.listPayload = [];
    this.searchText = searchText;
    if (this.searchText) {
      this.isLoad = true;
      this.messageSubscription = this.messageService
        .searchThreads(
          searchText,
          this.activeUser['_id'],
          0,
          this.selectedFilter['_id']
        )
        .subscribe(
          (threadList) => {
            this.threadList = this.threadList.concat(threadList);
            this.isLoad = false;
            this.buildPayload(threadList, null);
            this.detectChanges();
            this.cdr.detectChanges();
          },
          () => {
            this.isLoad = false;
          }
        );
    } else {
      this.getThreads();
    }
  }

  ionViewWillLeave() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.participantsSubscription) {
      this.participantsSubscription.unsubscribe();
    }
    if (this.appListSubscription) {
      this.appListSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  filterByApp(app, event) {
    if (this.currentEvent) {
      this.currentEvent.target.disabled = false;
    }
    if (app && app._id) {
      this.appList.forEach((item) => {
        item.isActive = app._id === item._id && !item.isActive ? true : false;
      });
    }
    this.selectedFilter = app.isActive ? app : {};
    if (this.searchText) {
      this.onSearchTextChanged(this.searchText);
    } else {
      this.getThreads();
    }
  }

  redirectChat(data) {
    const matchedCard = this.threadList.find((item) => item._id === data.id);
    if (
      matchedCard.participants &&
      matchedCard.participants.sender &&
      matchedCard.participants.recipient.id
    ) {
      this.messageService.activeChat = matchedCard;
      this.router.navigate([`/tabs/message/send`, data.id], {
        queryParams: {
          senderId: matchedCard.participants.sender.id,
          recipientId: matchedCard.participants.recipient.id,
          title: matchedCard.title,
          skip: 0,
          limit: 20,
        },
      });
    } else {
      this.toastService.presentToast({
        message: `The sender / recipient participant is not found`,
      });
    }
  }
}
