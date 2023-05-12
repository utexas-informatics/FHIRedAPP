import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCardListComponent } from './ion-card-list.component';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule],
  declarations: [IonCardListComponent],
  exports: [IonCardListComponent],
})
export class IonCardListComponentModule {}
