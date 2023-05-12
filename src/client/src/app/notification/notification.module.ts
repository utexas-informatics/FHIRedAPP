import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationPageRoutingModule } from './notification-routing.module';

import { NotificationPage } from './notification.page';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';
import { DateSuffixPipe } from '../utils/date-suffix.pipe';
import { HomeHeaderComponentModule } from '../utils/home-header/home-header.component.module';
import { IonCardListComponentModule } from '../utils/ion-card-list/ion-card-list-component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationPageRoutingModule,
    HomeHeaderComponentModule,
    IonCardListComponentModule,
  ],
  declarations: [
    NotificationPage,
    NotificationListComponent,
    NotificationDetailsComponent,
    DateSuffixPipe,
  ],
})
export class NotificationPageModule {}
