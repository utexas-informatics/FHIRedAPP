import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

import { Notification } from '../notification';
import { apiAssetsBaseUrl } from '../../utils/constants';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
})
export class NotificationListComponent implements OnInit, OnChanges {
  moment: any = moment;
  @Input()
  listHeader: string;
  @Input()
  notificationList: Notification[] = [];
  displayList: any = [];
  readonly apiAssetsBaseUrl = apiAssetsBaseUrl;

  constructor(private route: ActivatedRoute, private router: Router) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.buildNotification();
  }

  ngOnInit() {}

  buildNotification() {
    this.displayList = [];
    const updatedList = this.notificationList.map((item: any) => {
      return {
        id: item.notification._id,
        title: item.notification.title,
        appName: item?.notification?.app?.appName
          ? item.notification.app.appName
          : 'FhiredApp',
        appIcon: item?.notification?.app?._id
          ? item.notification.app._id === '5fec6f918048d25b1c189a2e'
            ? 'study-app-sm'
            : 'aunt-bertha-sm'
          : 'fhiredapp-logo',
        content: item.notification.message,
        date: item.notification.updatedAt,
        slider: [{ name: 'Read' }],
        isSlide: false,
        borderClass: !item.isRead ? 'unread-card' : 'read-card',
        unreadCount: '',
      };
    });
    this.displayList = this.displayList.concat(updatedList);
  }

  openNotification(event, nId) {
    this.router.navigate(['details', nId], {
      relativeTo: this.route,
    });
  }
  showDayDiff(date) {
    const diff = moment()
      .startOf('day')
      .diff(moment(date).startOf('day'), 'days');
    switch (diff) {
      case 0:
        return 'today';
      case 1:
        return 'yesterday';
      default:
        return `${diff}d ago`;
    }
  }
}
