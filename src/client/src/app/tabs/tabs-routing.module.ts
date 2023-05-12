import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        
        loadChildren: () =>
          import('../home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'notification',
        loadChildren: () =>
          import('../notification/notification.module').then(
            (m) => m.NotificationPageModule
          ),
      },
      {
        path: 'myRecords',
        loadChildren: () =>
          import('../my-records/my-records.module').then((m) => m.MyRecordsPageModule),
      },
      // {
      //   path: 'myRecordsdetails',
      //   loadChildren: () =>
      //     import('../my-records/my-records-details/my-records-details.module').then((m) => m.MyRecordsDetailsPageModule),
      // },
      {
        path: 'message',
        loadChildren: () =>
          import('../message/message.module').then((m) => m.MessagePageModule),
      },
      {
        path: 'apps',
        loadChildren: () =>
          import('../apps/apps.module').then((m) => m.AppsPageModule),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../profile-tab/profile-tab.module').then(
            (m) => m.ProfileTabPageModule
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
