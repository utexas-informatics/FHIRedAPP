import { NgModule, } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { HomeCardComponent } from './home-card.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  declarations: [
    HomeCardComponent
  ],
  exports: [
    HomeCardComponent
  ]
})
export class HomeCardComponentModule { }