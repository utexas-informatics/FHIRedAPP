import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { UserService } from './profile/user.service';
import { TabService } from './tabs/tab.service';
import { User } from './profile/user';
import { ToastService } from './utils/toast.service';
import { MessageService } from './message/message.service';

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private isPushRegistered:boolean=false;
  constructor(
    public tabService: TabService,
    public userService: UserService,
    private toastService: ToastService,
    private messageService: MessageService
  ) {}

  initPush(user: User) {
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      this.userService
        .updateProfile(user._id, { pushToken: token.value })
        .subscribe();
        if(token.value !=null)
        this.isPushRegistered=true;
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        this.toastService.presentToast({ message: notification.body });
        if (notification.data.redirect === 'message') {
          this.messageService.unreadCount(user._id);
          this.messageService.setNotifyMessage();
        }
        if (notification.data.redirect === 'medicalRecords' && user.email) {
          this.userService.fetchUserByEmailId(user.email, 'false');
        }
        PushNotifications.removeAllDeliveredNotifications();
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        if (notification.notification.data.redirect == 'message')
          this.tabService.setTabChange('message');
        else if (
          notification.notification.data.redirect === 'medicalRecords' &&
          user.email
        ) {
          user.datavantMatchStatus = 'matchFound';
          this.userService.setUser(user);
          this.tabService.setTabChange('myRecords');
        } else this.tabService.setTabChange('notification');
      }
    );
  }
  setIsPushRegistered(isPushRegistered:boolean){
    this.isPushRegistered=isPushRegistered;
  }
  IsPushRegistered(){
    return this.isPushRegistered;
  }
}
