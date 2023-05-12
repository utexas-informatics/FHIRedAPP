import { NgModule, } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { HomeHeaderComponent } from './home-header.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  declarations: [
    HomeHeaderComponent
  ],
  exports: [
    HomeHeaderComponent
  ]
})
export class HomeHeaderComponentModule { }