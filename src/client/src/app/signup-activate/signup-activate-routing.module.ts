import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignupActivatePage } from './signup-activate.page';

const routes: Routes = [
  {
    path: ':code',
    component: SignupActivatePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignupActivatePageRoutingModule {}
