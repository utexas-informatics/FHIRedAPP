import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessagePageRoutingModule } from './message-routing.module';

import { ListPage } from './list/list.page';
import { SendMessagePage } from './send-message/send-message.page';
import { IonCardListComponent } from '../utils/ion-card-list/ion-card-list.component';
import { HomeHeaderComponentModule } from '../utils/home-header/home-header.component.module';
import { IonCardListComponentModule } from '../utils/ion-card-list/ion-card-list-component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessagePageRoutingModule,
    HomeHeaderComponentModule,
    IonCardListComponentModule,
  ],
  declarations: [ListPage, SendMessagePage],
})
export class MessagePageModule {}
