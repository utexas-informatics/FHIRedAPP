import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { MenuComponent } from '../menu/menu.component';
import { Platform } from '@ionic/angular';
@Component({
  selector: 'home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss'],
})
export class HomeHeaderComponent implements OnInit, OnDestroy {
  @Input('headerProps') headerProps;
  @Input('showSearch') showSearch;
  @Output('onSearchTextChanged') onSearchTextChanged: EventEmitter<string> =
    new EventEmitter();
  public searchInfo = { text: '' };

  category: any;
  values = [];
  searchTerm: string = '';
  show: any;
  testtext = 'hiiiiii';
  public isIOS: boolean = true;
  constructor(
    private navCtrl: NavController,
    private router: Router,
    public popoverController: PopoverController,
    private platform: Platform
  ) {
    this.category = [
      { title: 'Vitals' },
      { title: 'Lab Results' },
      { title: 'Medication' },
      { title: 'Diagnosis' },
      { title: 'Visits' },
      { title: 'Procedures' },
    ];
    this.values = [];
  }
  filterItems(event) {
    if (event.detail.value) {
      let temp = [];
      this.category.forEach((item) => {
        temp.push(event.detail.value + ' | in ' + item.title);
      });
      this.values = temp;
    } else this.values = [];
  }
  ngOnInit() {
    if (
      (this.platform.is('ios') || this.platform.is('iphone')) &&
      this.platform.is('mobile')
    ) {
      this.isIOS = true;
    } else {
      //web application
      this.isIOS = false;
    }
  }
  ionViewWillEnter() {
    this.show = this.showSearch;
  }
  ngOnDestroy() {
    this.searchInfo = { text: null };
  }
  goBack() {
    this.navCtrl.pop();
  }
  ionChange(text: string) {
    this.values = [];
    this.searchTerm = '';
    this.onSearchTextChanged.emit(text);
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: MenuComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
  }
}
