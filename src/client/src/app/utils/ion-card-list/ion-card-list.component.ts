import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-ion-card-list',
  templateUrl: './ion-card-list.component.html',
  styleUrls: ['./ion-card-list.component.scss'],
})
export class IonCardListComponent implements OnInit {
  moment: any = moment;
  @Input()
  item: any;
  @Output('selectCard') selectCard: EventEmitter<string> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  onSearchTextChanged(data) {}

  showDayDiff(date) {
    const diff = moment()
      .startOf('day')
      .diff(moment(date).startOf('day'), 'days');
    switch (diff) {
      case 0:
        return moment(new Date(date)).format('hh:mm A');
      case 1:
        return 'yesterday';
      default:
        return `${diff}d ago`;
    }
  }

  selectedCard(data) {
    this.selectCard.emit(data);
  }
}
