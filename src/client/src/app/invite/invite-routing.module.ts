import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvitePage } from './invite.page';
import { InviteCodeAddComponent } from './invite-code-add/invite-code.component';
import { AuthGuard } from '../auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: InvitePage,
  },
  {
    path: 'inviteCodeAdd',
    component: InviteCodeAddComponent,
    canActivate: [AuthGuard],

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvitePageRoutingModule { }
