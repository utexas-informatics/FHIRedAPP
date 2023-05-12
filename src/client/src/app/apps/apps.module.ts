import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppsPageRoutingModule } from './apps-routing.module';

import { AppsPage } from './apps.page';
import { AppListComponent } from './app-list/app-list.component';
import { AppDetailsPage } from './app-details/app-details.page';
import { ConsentComponent } from './consent/consent.component';
import { MyAppsPage } from './my-apps/my-apps.page';
import { MedicalRecordListComponent } from './app-details/medical-records/medical-records.component';
import { SharedModule } from '../utils/shared/shared.module';
import { IonicOpenAppComponent } from './ionic-open-app/ionic-open-app.component';
import { HomeHeaderComponentModule } from '../utils/home-header/home-header.component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppsPageRoutingModule,
    SharedModule,
    HomeHeaderComponentModule,
  ],
  declarations: [
    AppsPage,
    AppListComponent,
    AppDetailsPage,
    ConsentComponent,
    MyAppsPage,
    MedicalRecordListComponent,
    IonicOpenAppComponent,
  ],
  entryComponents: [ConsentComponent],
})
export class AppsPageModule {}
