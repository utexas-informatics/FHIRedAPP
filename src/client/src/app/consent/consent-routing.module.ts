import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsentPage } from './consent.page';

const routes: Routes = [
  {
    path: ':code',
    component: ConsentPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsentPageRoutingModule {}
