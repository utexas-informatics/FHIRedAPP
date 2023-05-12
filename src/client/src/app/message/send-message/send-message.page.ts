import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../utils/toast.service';
import { MessageService } from '../message.service';
import { IonContent, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { skip } from 'rxjs/operators';
import { User } from 'src/app/profile/user';
import { UserService } from 'src/app/profile/user.service';
import { AuditService } from 'src/app/audit.service';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.page.html',
  styleUrls: ['./send-message.page.scss'],
})
export class SendMessagePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;

  public list;
  public threadId;
  public queryParams;
  public messages: any = [];
  public isLoad = false;
  public messageInfo: any = {};
  public dateList: any = [];
  markAsReadSubscription: Subscription;
  getChatsSubscription: Subscription;
  sendMessageSubscription: Subscription;
  messageSubscription: Subscription;
  userSubscription: Subscription;
  public isIOS: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private router: Router,
    private messageService: MessageService,
    private userService: UserService,
    private auditService: AuditService,
    private platform: Platform
  ) {
    if (
      (this.platform.is('ios') || this.platform.is('iphone')) &&
      this.platform.is('mobile')
    ) {
      this.isIOS = true;
    } else {
      //web application
      this.isIOS = false;
    }
    this.messages = [];
    this.dateList = [];
  }
  ngOnInit() {
    this.messageSubscription = this.messageService.notifyMessage$
      .pipe(skip(1))
      .subscribe((res: object) => {
        this.getRecentChats();
      });
  }

  ionViewWillEnter() {
    this.threadId = this.activatedRoute.snapshot.params.id;
    this.queryParams = this.activatedRoute.snapshot.queryParams;
    if (!this.threadId) {
      this.toastService.presentToast({
        message: `Required Thread Id in the URL`,
      });
      this.router.navigate([`/tabs/message/list`]);
    } else if (
      this.queryParams &&
      (!this.queryParams.senderId ||
        !this.queryParams.recipientId ||
        !this.queryParams.skip ||
        !this.queryParams.limit)
    ) {
      this.toastService.presentToast({
        message: `Required queryParams in the URL`,
      });
      this.router.navigate([`/tabs/message/list`]);
    } else if (!this.messageService.activeChat) {
      // this.toastService.presentToast({
      //   message: `Selected Thread not found`,
      // });
      this.router.navigate([`/tabs/message/list`]);
    } else {
      this.isLoad = true;
      this.markAsRead();
      this.getChats(this.queryParams.skip, null, true, this.queryParams.limit);
    }
    this.sendAudit();
  }

  sendAudit() {
    const auditInfo = {
      action: 'PageVisits',
      actionData: [
        {
          name: 'page',
          value: 'message-chat',
        },
      ],
      entity: 'visits',
      change: [],
      createdBy: this.userService.getUser()._id,
    };
    this.auditService.generateAudit(auditInfo);
  }

  markAsRead() {
    this.markAsReadSubscription = this.messageService
      .markAsRead(
        this.threadId,
        this.queryParams.recipientId,
        this.queryParams.senderId
      )
      .subscribe((res) => {
        this.messageService.unreadCount(this.queryParams.recipientId);
      });
  }
  ScrollToBottom() {
    this.content.scrollToBottom(1500);
  }

  getChats(skip = 0, event = null, isLoad = false, limit = 20) {
    this.getChatsSubscription = this.messageService
      .getChats(
        this.threadId,
        this.queryParams.senderId,
        this.queryParams.recipientId,
        skip,
        limit
      )
      .subscribe((res) => {
        if (res && res[0] && res[0].chats && res[0].chats.length) {
          const recentMessages = res[0].chats.reverse();
          const updatedMessage = this.userAlignment(
            recentMessages,
            this.messages[this.messages.length]
          );
          this.messages = [...updatedMessage, ...this.messages];
          if (isLoad) {
            this.isLoad = false;
            setTimeout(() => {
              this.content.scrollToBottom(1);
            }, 10);
          }
        } else {
          if (!res.length && event) {
            event.target.disabled = true;
          }
          // this.toastService.presentToast({
          //   message: `We don't have any more previous chats`,
          // });
        }
        if (event) {
          event.target.complete();
        }
      });
  }

  userAlignment(list, lastMessage) {
    if (list && list.length) {
      return list.map((item, index, array) => {
        item.status = this.getStatus(item);
        if (
          index === 0 &&
          lastMessage &&
          this.getStatus(item) === this.getStatus(lastMessage)
        ) {
          item.isProfile = false;
        } else if (
          index > 0 &&
          this.getStatus(item) === this.getStatus(array[index - 1])
        ) {
          item.isProfile = false;
        } else {
          item.isProfile = true;
        }
        item.date = moment(new Date(item.postedAt)).format('hh:mm a');

        const dateTitle = moment(new Date(item.postedAt)).format('DD MMM YY');
        if (!this.dateList.includes(dateTitle)) {
          this.dateList.push(dateTitle);
          item.dateTitle = dateTitle;
        } else if (this.dateList.includes(dateTitle)) {
          const matchedMessage = this.messages.find((msg) => msg.dateTitle);
          if (matchedMessage) {
            matchedMessage.dateTitle = null;
            item.dateTitle = dateTitle;
          }
        }
        return item;
      });
    }
    return list;
  }

  getStatus(messageItem) {
    const status = {
      incoming: messageItem.sender.id !== this.queryParams.recipientId,
      outgoing: messageItem.sender.id === this.queryParams.recipientId,
    };
    return status.incoming ? 'incoming' : 'outgoing';
  }

  getUserSide(messageItem) {
    const status = {
      incoming: messageItem.sender.id !== this.queryParams.recipientId,
      outgoing: messageItem.sender.id === this.queryParams.recipientId,
    };
    return status.incoming ? { incoming: true } : { outgoing: true };
  }

  isShowProfile(messageItem, previousMessageItem) {
    const currentStatus = this.getUserSide(messageItem);
    if (previousMessageItem) {
      const previousStatus = this.getUserSide(previousMessageItem);
      return previousStatus.incoming === currentStatus.incoming ? false : true;
    }
    return true;
  }

  loadPreviousMessages(event) {
    if (this.messages.length) {
      this.getChats(this.messages.length, event);
    } else {
      event.target.complete();
    }
  }

  sendMessage() {
    if (this.messageInfo.message) {
      if (
        this.messageService.activeChat &&
        this.messageService.activeChat.participants &&
        this.messageService.activeChat.app._id
      ) {
        const payload = {
          body: this.messageInfo.message,
          // sender: this.messageService.activeChat.participants.recipient,
          recipient: this.messageService.activeChat.participants.sender,
        };

        this.sendMessageSubscription = this.messageService
          .sendMessage(
            this.threadId,
            payload,
            0,
            20,
            this.messageService.activeChat.app._id
          )
          .subscribe((res) => {
            this.updateMessage(res);
          });
      }
    } else {
      this.toastService.presentToast({
        type: 'warning',
        message: `Blank message not allowed`,
      });
    }
  }

  updateMessage(res) {
    if (res && res[0] && res[0].chats.length) {
      // this.toastService.presentToast({
      //   type: 'success',
      //   message: `Message sent successfully`,
      // });
      this.messageInfo.message = undefined;

      let lastChatIndex = res[0].chats.findIndex((item) => {
        return this.messages.find(
          (messageItem) => messageItem._id === item._id
        );
      });
      if (lastChatIndex > -1) {
        this.markAsRead();
        const unreadMessages = res[0].chats.slice(0, lastChatIndex++).reverse();
        const updatedMessage = this.userAlignment(
          unreadMessages,
          this.messages[this.messages.length]
        );
        this.messages = [...this.messages, ...updatedMessage];
        setTimeout(() => {
          this.content.scrollToBottom(1);
        }, 10);
      }
    }
  }

  getRecentChats() {
    this.getChatsSubscription = this.messageService
      .getChats(
        this.threadId,
        this.queryParams.senderId,
        this.queryParams.recipientId,
        0,
        20
      )
      .subscribe((res) => {
        this.updateMessage(res);
      });
  }

  ionViewWillLeave() {
    this.messageService.activeChat = undefined;
    this.dateList = [];
    this.messages = [];
    if (this.getChatsSubscription) {
      this.getChatsSubscription.unsubscribe();
    }
    if (this.markAsReadSubscription) {
      this.markAsReadSubscription.unsubscribe();
    }
    if (this.sendMessageSubscription) {
      this.sendMessageSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
