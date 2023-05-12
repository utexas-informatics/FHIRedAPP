import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupPasswordPageRoutingModule } from './signup-password-routing.module';

import { SignupPasswordPage } from './signup-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupPasswordPageRoutingModule,
  ],
  declarations: [SignupPasswordPage],
})
export class SignupPasswordPageModule {}
