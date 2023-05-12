import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsentPageRoutingModule } from './consent-routing.module';

import { ConsentPage } from './consent.page';
import { SharedModule } from '../utils/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsentPageRoutingModule,
    SharedModule,
  ],
  declarations: [ConsentPage],
})
export class ConsentPageModule {}
