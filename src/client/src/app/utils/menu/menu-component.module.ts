import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from './menu.component';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule],
  declarations: [MenuComponent],
  exports: [MenuComponent],
})
export class MenuComponentModule {}
