import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmailVerificationPageRoutingModule } from './email-verification-routing.module';

import { EmailVerificationPage } from './email-verification.page';
import { MinutePipe } from '../utils/minute.pipe';
import { SecondPipe } from '../utils/second.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmailVerificationPageRoutingModule,
  ],
  declarations: [EmailVerificationPage, MinutePipe, SecondPipe],
})
export class EmailVerificationPageModule {}
