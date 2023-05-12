import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginOptionsPageRoutingModule } from './login-options-routing.module';

import { LoginOptionsPage } from './login-options.page';
import { LoginOptionsModalComponent } from './login-options-modal/login-options-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginOptionsPageRoutingModule,
  ],
  declarations: [LoginOptionsPage, LoginOptionsModalComponent],
  entryComponents: [LoginOptionsModalComponent],
})
export class LoginOptionsPageModule {}
