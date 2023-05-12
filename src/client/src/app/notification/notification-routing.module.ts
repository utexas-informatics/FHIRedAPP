import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';
import { IonicOpenAppComponent } from '../apps/ionic-open-app/ionic-open-app.component';

import { NotificationPage } from './notification.page';

const routes: Routes = [
  {
    path: '',
    component: NotificationPage,
  },
  {
    path: 'openapp',
    component: IonicOpenAppComponent,
  },
  {
    path: 'details/:notificationId',
    component: NotificationDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationPageRoutingModule {}
