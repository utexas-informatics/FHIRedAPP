import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyRecordsPage } from './my-records.page';
import {MyRecordsCategoryListPage} from './my-records-category-list/my-records-category-list.page'
import {MyRecordsDetailsComponent}  from './my-records-details/my-records-details.component'

const routes: Routes = [
  {
    path: '',
    component: MyRecordsPage
  },
  {
    path: 'my-records-category-list',
    component:MyRecordsCategoryListPage
  },
  {
    path: 'my-records-details',
    component:MyRecordsDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyRecordsPageRoutingModule {}
