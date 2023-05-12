import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppDetailsPage } from './app-details/app-details.page';
import { IonicOpenAppComponent } from './ionic-open-app/ionic-open-app.component';

import { MyAppsPage } from './my-apps/my-apps.page';

import { AppsPage } from './apps.page';

const routes: Routes = [
  {
    path: '',
    component: AppsPage,
  },
  {
    path: 'my-apps/:userId',
    component: MyAppsPage,
  },
  {
    path: 'app-details/:appId',
    component: AppDetailsPage,
  },
  {
    path: 'openapp',
    component: IonicOpenAppComponent,
  },
  {
    path: 'app-details/:appId/openapp',
    component: IonicOpenAppComponent,
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppsPageRoutingModule {}
