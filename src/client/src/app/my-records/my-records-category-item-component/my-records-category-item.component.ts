import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'my-records-category-item',
  templateUrl: './my-records-category-item.component.html',
  styleUrls: ['./my-records-category-item.component.scss'],
})
export class MyRecordsCategoryListItemComponentComponent implements OnInit {
  @Input('props') props;
  @Input('category') category;

  public title: string;
  public subTitle: string;
  public date: Number;
  public month: string;
  constructor () {}

  ngOnInit () {
    this.getTitle();
    this.getSubtitle();
    this.dateConversion(this.props.date? this.props.date: this.props.resource.issued);
  }

  dateConversion (date) {
    this.date = moment(date).date();
    this.month = moment(moment(date).month() + 1, 'MM')
      .format('MMMM')
      .substring(0, 3);
  }

  getTitle () {
    switch (this.category.type) {
      case 'Medication':
        this.title =
          this.props.title.display
          break;
      case 'Vitals':
        this.title =
          this.props.resource.code && this.props.resource.code.coding
            ? this.props.resource.code.coding[0].display
            : '';
        break;
      case 'Lab Results':
        this.title =
          this.props.resource.code && this.props.resource.code.coding
            ? this.props.resource.code.coding[0].display
            : '';
        break;
      case 'Procedures':
        this.title =
          this.props.resource.performer &&
          this.props.resource.performer[0] &&
          this.props.resource.performer[0].function &&
          this.props.resource.performer[0].function.coding[0]
            ? this.props.resource.performer[0].function.coding[0].display
            : '';
        break;
      case 'Visits':
        this.title = this.props.resource.type &&
        this.props.resource.type[0] &&
        this.props.resource.type[0].coding &&
        this.props.resource.type[0].coding[0]
          ? this.props.resource.type[0].coding[0].display:''
        break;
      case 'Diagnosis':
        this.title =
          this.props.resource.code && this.props.resource.code.coding[0]
            ? this.props.resource.code.coding[0].display
            : '';
        break;
    }
  }

  getSubtitle () {
    switch (this.category.type) {
      case 'Medication':
        this.subTitle =
        this.props.subtitle
        break;
      case 'Vitals':
        this.subTitle =
          this.props.resource.performer && this.props.resource.performer[0]
            ? this.props.resource.performer[0].type
            : '';
        break;
      case 'Lab Results':
        this.subTitle =
          this.props.resource.performer && this.props.resource.performer[0]
            ? this.props.resource.performer[0].type
            : '';
        break;
      case 'Procedures':
        this.subTitle = '';
        break;
      case 'Visits':
        this.subTitle = '';
        break;
      case 'Diagnosis':
        this.subTitle = '';
        break;
    }
  }
}
