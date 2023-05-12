import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { MyRecordsService } from '../myrecords.service';

@Component({
  selector: 'app-my-records-details',
  templateUrl: './my-records-details.component.html',
  styleUrls: ['./my-records-details.component.scss'],
})
export class MyRecordsDetailsComponent implements OnInit {
  public recordDetails: any;
  category: any;
  keyValue = [];
  title: String;
  subTitle: string;
  date: string;
  facility: string;
  public isIOS: boolean = true;

  constructor(
    public navCtrl: NavController,
    private myrecordsService: MyRecordsService,
    private platform: Platform
  ) {
    if (
      (this.platform.is('ios') || this.platform.is('iphone')) &&
      this.platform.is('mobile')
    ) {
      this.isIOS = true;
    } else {
      //web application
      this.isIOS = false;
    }
    this.recordDetails = this.myrecordsService.getSelectedClinicalDetails();
    this.category = this.myrecordsService.getSelectedCategory();
  }

  ngOnInit() {
    this.parseData();
    this.setTitle();
    this.setSubTitle();
    this.setFacility();
    this.setDate();
  }

  setTitle() {
    this.title = this.category.type + ' Record';
  }
  setSubTitle() {
    switch (this.category.type) {
      case 'Medication':
        this.subTitle = this.recordDetails.title.display;
        break;
      case 'Vitals':
        this.subTitle =
          this.recordDetails.resource.code &&
          this.recordDetails.resource.code.coding
            ? this.recordDetails.resource.code.coding[0].display
            : '';
        break;
      case 'Diagnosis':
        this.subTitle = this.recordDetails.resource.code.coding[0].display;
        break;
      case 'Lab Results':
        this.subTitle = this.recordDetails.resource.code
          ? this.recordDetails.resource.code.coding[0].display
          : '';
        break;
      case 'Procedures':
        this.subTitle =
          this.recordDetails.resource.performer &&
          this.recordDetails.resource.performer[0] &&
          this.recordDetails.resource.performer[0].function &&
          this.recordDetails.resource.performer[0].function.coding[0]
            ? this.recordDetails.resource.performer[0].function.coding[0]
                .display
            : '';
        break;
      case 'Visits':
        this.subTitle =
          this.recordDetails.resource.type &&
          this.recordDetails.resource.type[0] &&
          this.recordDetails.resource.type[0].coding &&
          this.recordDetails.resource.type[0].coding[0]
            ? this.recordDetails.resource.type[0].coding[0].display
            : '';
        break;
    }
  }
  setFacility() {
    let res;
    switch (this.category.type) {
      case 'Medication':
        this.facility = this.recordDetails.facility;
        break;
      case 'Vitals':
        res = this.myrecordsService.filter(
          'id',
          'facilityLabel',
          this.recordDetails.resource.extension
        );
        this.facility = res[0].valueString;
        break;
      case 'Diagnosis':
        res = this.myrecordsService.filter(
          'id',
          'facility_label',
          this.recordDetails.resource.extension
        );
        this.facility = res[0].valueString;
        break;
      case 'Lab Results':
        res = this.myrecordsService.filter(
          'id',
          'facilityLabel',
          this.recordDetails.resource.extension
        );
        this.facility = res[0].valueString;
        break;
      case 'Procedures':
        res = this.myrecordsService.filter(
          'id',
          'facilityLabel',
          this.recordDetails.resource.extension
        );
        this.facility = res[0].valueString;
        break;
      case 'Visits':
        res = this.myrecordsService.filter(
          'id',
          'facilityLabel',
          this.recordDetails.resource.extension
        );
        this.facility = res[0].valueString;
        break;
    }
  }

  setDate() {
    switch (this.category.type) {
      case 'Medication':
        this.date = moment(this.recordDetails.date).format('DD-MMM-YYYY');
        break;
      case 'Vitals':
        this.date = moment(this.recordDetails.resource.issued).format(
          'DD-MMM-YYYY'
        );
        break;
      case 'Diagnosis':
        this.date = '';
        break;
      case 'Lab Results':
        this.date = moment(this.recordDetails.resource.issued).format(
          'DD-MMM-YYYY'
        );
        break;
      case 'Visits':
        let res = this.myrecordsService.filter(
          'id',
          'activityTime',
          this.recordDetails.resource.extension
        );
        if (res != null && res.length > 0)
          this.date = moment(res[0].valueString).format('DD-MMM-YYYY');
        break;
      case 'Procedures':
        this.date = '';
        break;
    }
  }

  goBack() {
    this.navCtrl.pop();
  }

  parseData() {
    switch (this.category.type) {
      case 'Medication':
        this.parseMedicationData();
        break;
      case 'Vitals':
        this.parseVitalData();
        break;
      case 'Lab Results':
        this.parseLabResultData();
        break;
      case 'Diagnosis':
        this.parseDiagnosisData();
        break;
      case 'Procedures':
        this.parseProcedureData();
        break;
      case 'Visits':
        this.parseEncounterData();
        break;
    }
  }
  parseMedicationData() {
    this.keyValue = [...this.recordDetails.keyValue];
    // this.keyValue.push({ key: 'Source Facility', value: '' });
  }
  parseVitalData() {
    // add code
    let res = this.myrecordsService.filter(
      'id',
      'sourceFacilityLabel',
      this.recordDetails.resource.extension
    );

    if (res != null && res.length > 0)
      this.keyValue.push({ key: 'Source Facility', value: res[0].valueString });

    // code
    if (
      this.recordDetails.resource.code != null &&
      this.recordDetails.resource.code.coding.length > 0
    ) {
      this.keyValue.push({
        key: 'Vital Code',
        value: this.recordDetails.resource.code.coding[0].code,
      });
    }
    // code label
    if (
      this.recordDetails.resource.code != null &&
      this.recordDetails.resource.code.coding.length > 0
    ) {
      this.keyValue.push({
        key: 'Vital Label',
        value: this.recordDetails.resource.code.coding[0].display,
      });
    }

    // add activity time
    if (this.recordDetails.resource.issued != null) {
      this.keyValue.push({
        key: 'Activity Date Time',
        value: moment(this.recordDetails.resource.issued).format(
          'DD-MMM-YYYY , h:mm:ss a'
        ),
      });
    }

    // add valueQuantity
    if (this.recordDetails.resource.valueQuantity != null) {
      this.keyValue.push({
        key: 'Observation Value',
        value:
          this.recordDetails.resource.valueQuantity.value +
          (this.recordDetails.resource.valueQuantity.unit
            ? this.recordDetails.resource.valueQuantity.unit
            : ''),
      });
    }

    // add valueQuantity
    if (
      this.recordDetails.resource.referenceRange != null &&
      this.recordDetails.resource.referenceRange.length > 0
    ) {
      if (this.recordDetails.resource.referenceRange.text != null)
        this.keyValue.push({
          key: 'Reference Range',
          value: this.recordDetails.resource.referenceRange.text,
        });
      else
        this.keyValue.push({
          key: 'Reference Range',
          value:
            this.recordDetails.resource.referenceRange[0].low.value +
            this.recordDetails.resource.referenceRange[0].low.value,
        });
    }
    // add interpretation Status
    if (this.recordDetails.resource.interpretation != null) {
      this.keyValue.push({
        key: 'Interpretation Status',
        value: this.recordDetails.resource.interpretation[0],
      });
    }
  }

  parseLabResultData() {
    // add code
    let res = this.myrecordsService.filter(
      'id',
      'sourceFacilityLabel',
      this.recordDetails.resource.extension
    );

    if (res != null && res.length > 0)
      this.keyValue.push({ key: 'Source Facility', value: res[0].valueString });

    // code
    if (
      this.recordDetails.resource.code != null &&
      this.recordDetails.resource.code.coding.length > 0
    ) {
      this.keyValue.push({
        key: 'Lab Code',
        value: this.recordDetails.resource.code.coding[0].code,
      });
    }
    // code label
    if (
      this.recordDetails.resource.code != null &&
      this.recordDetails.resource.code.coding.length > 0
    ) {
      this.keyValue.push({
        key: 'Lab Label',
        value: this.recordDetails.resource.code.coding[0].display,
      });
    }

    // add activity time
    if (this.recordDetails.resource.issued != null) {
      this.keyValue.push({
        key: 'Activity Date Time',
        value: moment(this.recordDetails.resource.issued).format(
          'DD-MMM-YYYY , h:mm:ss a'
        ),
      });
    }

    // add valueQuantity
    if (this.recordDetails.resource.valueQuantity != null) {
      this.keyValue.push({
        key: 'Observation Range',
        value:
          this.recordDetails.resource.valueQuantity.value +
          (this.recordDetails.resource.valueQuantity.unit
            ? this.recordDetails.resource.valueQuantity.unit
            : ''),
      });
    }

    // add valueQuantity
    if (
      this.recordDetails.resource.referenceRange != null &&
      this.recordDetails.resource.referenceRange.length > 0
    ) {
      if (this.recordDetails.resource.referenceRange.text != null)
        this.keyValue.push({
          key: 'Observation Reference Range',
          value: this.recordDetails.resource.referenceRange.text,
        });
      else
        this.keyValue.push({
          key: 'Observation Reference Range',
          value:
            this.recordDetails.resource.referenceRange[0].low.value +
            this.recordDetails.resource.referenceRange[0].low.value,
        });
    }
    // add interpretation Status
    if (this.recordDetails.resource.interpretation != null) {
      this.keyValue.push({
        key: 'Interpretation Status',
        value: this.recordDetails.resource.interpretation[0],
      });
    }
  }

  filter(key, value, array) {
    let result = array.filter(function (item) {
      if (item[key] == value) {
        return item;
      }
    });
    return result;
  }

  parseDiagnosisData() {
    // add code
    let res = this.myrecordsService.filter(
      'id',
      'type',
      this.recordDetails.resource.extension
    );

    if (res != null && res.length > 0)
      this.keyValue.push({ key: 'Type', value: res[0].valueString });

    //  label
    if (
      this.recordDetails.resource.code != null &&
      this.recordDetails.resource.code.coding.length > 0
    ) {
      this.keyValue.push({
        key: 'Diagnosis Label',
        value: this.recordDetails.resource.code.coding[0].display,
      });
    }
    // code
    if (
      this.recordDetails.resource.severity != null &&
      this.recordDetails.resource.severity.coding.length > 0
    ) {
      this.keyValue.push({
        key: 'Severity Code',
        value: this.recordDetails.resource.code.coding[0].code,
      });
    }

    // add activity time
    if (this.recordDetails.resource.issued != null) {
      this.keyValue.push({
        key: 'Activity Date Time',
        value: moment(this.recordDetails.resource.issued).format(
          'DD-MMM-YYYY , h:mm:ss a'
        ),
      });
    }
  }

  parseProcedureData() {
    // add code
    let res = this.myrecordsService.filter(
      'id',
      'type',
      this.recordDetails.resource.extension
    );

    if (res != null && res.length > 0)
      this.keyValue.push({ key: 'Type', value: res[0].valueString });

    //  source facility
    res = this.myrecordsService.filter(
      'id',
      'sourceFacilityKey',
      this.recordDetails.resource.extension
    );

    if (res != null && res.length > 0)
      this.keyValue.push({ key: 'Source Facility', value: res[0].valueString });

    if (
      this.recordDetails.resource.code != null &&
      this.recordDetails.resource.code.coding.length > 0
    ) {
      this.keyValue.push({
        key: 'PRocedure Label',
        value: this.recordDetails.resource.code.coding[0].display,
      });
    }

    // code
    if (
      this.recordDetails.resource.severity != null &&
      this.recordDetails.resource.severity.coding.length > 0
    ) {
      this.keyValue.push({
        key: 'Severity Code',
        value: this.recordDetails.resource.code.coding[0].code,
      });
    }

    // add activity time
    if (this.recordDetails.resource.issued != null) {
      this.keyValue.push({
        key: 'Activity Date Time',
        value: moment(this.recordDetails.resource.issued).format(
          'DD-MMM-YYYY , h:mm:ss a'
        ),
      });
    }
  }

  parseEncounterData() {
    // add code
    let res = this.myrecordsService.filter(
      'id',
      'sourceFacility',
      this.recordDetails.resource.extension
    );

    if (res != null && res.length > 0)
      this.keyValue.push({
        key: 'Source Facility ',
        value: res[0].valueString,
      });

    //  label
    if (
      this.recordDetails.resource.class != null &&
      this.recordDetails.resource.class.display != null
    ) {
      this.keyValue.push({
        key: 'Encounter Classs',
        value: this.recordDetails.resource.class.display,
      });
    }
    // code

    if (
      this.recordDetails.resource.contained &&
      this.recordDetails.resource.contained[1]
    ) {
      this.keyValue.push({
        key: 'Location',
        value: this.recordDetails.resource.contained[1].description,
      });
    }

    // add activity time
    if (this.recordDetails.resource.issued != null) {
      this.keyValue.push({
        key: 'Activity Date Time',
        value: moment(this.recordDetails.resource.issued).format(
          'DD-MMM-YYYY , h:mm:ss a'
        ),
      });
    }
  }
}
