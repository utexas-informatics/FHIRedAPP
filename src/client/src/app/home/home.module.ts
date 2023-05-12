import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';

import { HomeHeaderComponentModule } from './../utils/home-header/home-header.component.module';

import { MedicationCapsuleComponent } from './../utils/medication-capsule/medication-capsule.component';
import {HomeMypluginCardComponent} from './../utils/home-myplugin-card/home-myplugin-card.component';
import { HomeCardComponentModule } from '../utils/home-card/home-card.component.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule,HomeHeaderComponentModule, HomeCardComponentModule],
  declarations: [HomePage,MedicationCapsuleComponent,HomeMypluginCardComponent],
})
export class HomePageModule {}
