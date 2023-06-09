import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListPage } from './list/list.page';
import { SendMessagePage } from './send-message/send-message.page';

const routes: Routes = [
  {
    path: '',
    component: ListPage,
  },

  {
    path: 'send/:id',
    component: SendMessagePage,
  },
  {
    path: 'list',
    component: ListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessagePageRoutingModule {}
