import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyRecordsPageRoutingModule } from './my-records-routing.module';
import {MyRecordsCategoryListPage} from'./my-records-category-list/my-records-category-list.page'
import { MyRecordsPage } from './my-records.page';
import {MyRecordsCategoryListItemComponentComponent} from './my-records-category-item-component/my-records-category-item.component'
import { HomeHeaderComponentModule } from './../utils/home-header/home-header.component.module';
import {MyRecordsDetailsComponent} from './my-records-details/my-records-details.component'
import { HomeCardComponentModule } from '../utils/home-card/home-card.component.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyRecordsPageRoutingModule,
    HomeHeaderComponentModule,
    HomeCardComponentModule
  ],
  declarations: [MyRecordsPage,MyRecordsCategoryListPage,MyRecordsCategoryListItemComponentComponent,MyRecordsDetailsComponent]
})
export class MyRecordsPageModule {}
