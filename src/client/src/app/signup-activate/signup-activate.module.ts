import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupActivatePageRoutingModule } from './signup-activate-routing.module';

import { SignupActivatePage } from './signup-activate.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupActivatePageRoutingModule,
  ],
  declarations: [SignupActivatePage],
})
export class SignupActivatePageModule {}
