import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { apiUrlConfig } from '../utils/constants';
import { MyRecordsCategories } from './myrecords';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../utils/toast.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class MyRecordsService {
  private selectedCategory;
  private selectedClinicalDetails;
  private search$ = new BehaviorSubject<{}>(null);

  constructor(private http: HttpClient, private toastService: ToastService) {}
  get searchText$(): Observable<{}> {
    return this.search$.asObservable();
  }

  setSearchText(search: any): void {
    this.search$.next(search);
    // sessionStorage.setItem('user', JSON.stringify(this.userSubject$.value));
  }
  setSelectedCategory(category: any) {
    this.selectedCategory = category;
  }
  getSelectedCategory() {
    return this.selectedCategory;
  }
  setSelectedClinicalDetails(details: any) {
    this.selectedClinicalDetails = details;
  }
  getSelectedClinicalDetails() {
    return this.selectedClinicalDetails;
  }

  fecthFhirPatientID(
    requestPayload: object,
    skip = 'false'
  ): Observable<any[]> {
    return this.http
      .post<any[]>(
        `${apiUrlConfig.getFhirPatientId}`,
        {
          ...requestPayload,
        },
        {
          headers: skip === 'true' ? { skip } : {},
        }
      )
      .pipe(
        catchError((err) => {
          if (err.error.status != 200) {
            this.toastService.presentToastWithClose({
              type: 'Error',
              message: err.error.message,
            });
          }
          return throwError(err);
        })
      );
  }

  fetchClinicalDataByCategory(
    requestPayload: object,
    skip = 'false'
  ): Observable<any[]> {
    return this.http
      .post<any[]>(
        `${apiUrlConfig.clinicalDataByCategory}`,
        {
          ...requestPayload,
        },
        {
          headers: skip === 'true' ? { skip } : {},
        }
      )
      .pipe(
        catchError((err) => {
          if (err.error.status != 200) {
            err.message = 'err';
            this.toastService.presentToastWithClose({
              type: 'Error',
              message: 'Failed to get the clinical categories',
            });
          }
          return throwError(err);
        })
      );
  }

  groupByKey(data, category) {
    switch (category) {
      case 'Vitals':
        return data.reduce((hash, obj) => {
          if (obj.resource.issued === undefined) return hash;
          return Object.assign(hash, {
            [moment(obj.resource.issued).format('MMMM YYYY')]: (
              hash[moment(obj.resource.issued).format('MMMM YYYY')] || []
            ).concat(obj),
          });
        }, {});

      case 'Medication':
        const updatedData = this.parseMedicationData(data);
        return updatedData.reduce((hash, obj) => {
          if (obj.date === undefined) return hash;
          return Object.assign(hash, {
            [moment(obj.date).format('MMMM YYYY')]: (
              hash[moment(obj.date).format('MMMM YYYY')] || []
            ).concat(obj),
          });
        }, {});

      default:
        return data.reduce((hash, obj) => {
          if (obj.resource.meta.lastUpdated === undefined) return hash;
          return Object.assign(hash, {
            [moment(obj.resource.meta.lastUpdated).format('MMMM YYYY')]: (
              hash[moment(obj.resource.meta.lastUpdated).format('MMMM YYYY')] ||
              []
            ).concat(obj),
          });
        }, {});
    }
  }

  parseMedicationData(response) {
    let medicationData = [];
    for (let i = 0; i < response.length; i++) {
      const responseData = response[i].response;
      switch (response[i].resourceName) {
        case 'MedicationStatement':
          if (responseData.entry != null && responseData.entry.length > 0) {
            responseData.entry.forEach((respObj) => {
              let obj: any = {};

              obj.title =
                respObj.resource.contained && respObj.resource.contained[0].code
                  ? respObj.resource.contained[0].code.coding[0]
                  : '';

              obj.subtitle =
                respObj.resource.dosage && respObj.resource.dosage[0].text
                  ? respObj.resource.dosage[0].text
                  : '';

              let serachRes = this.filter(
                'id',
                'refillsTotal',
                respObj.resource.extension ? respObj.resource.extension : []
              );

              obj.refill =
                serachRes && serachRes.length > 0
                  ? serachRes[0].valueString
                  : '';
              obj.rx = '';

              serachRes = this.filter(
                'id',
                'refillsRemaining',
                respObj.resource.extension ? respObj.resource.extension : []
              );

              obj.refillsRemaning =
                serachRes && serachRes.length > 0
                  ? serachRes[0].valueString
                  : '';

              serachRes = this.filter(
                'id',
                'accidentActivityTime',
                respObj.resource.extension ? respObj.resource.extension : []
              );

              obj.date =
                serachRes && serachRes.length > 0 ? serachRes[0].valueDate : '';
              obj.keyValue = [];
              serachRes = this.filter(
                'id',
                'facility',
                respObj.resource.extension ? respObj.resource.extension : []
              );
              if(obj.date!= null && obj.date != ''){
                obj.date = moment(obj.date);
              }
              obj.facility =
                serachRes && serachRes.length > 0
                  ? serachRes[0].valueString
                  : '';

              serachRes = this.filter(
                'id',
                'facilityKey',
                respObj.resource.extension ? respObj.resource.extension : []
              );
              obj.facilityKey =
                serachRes && serachRes.length > 0
                  ? serachRes[0].valueString
                  : '';

              serachRes = this.filter(
                'id',
                'sourceFacility',
                respObj.resource.extension ? respObj.resource.extension : []
              );
              obj.keyValue.push({
                key: 'sourceFacility',
                value:
                  serachRes && serachRes.length > 0
                    ? serachRes[0].valueString
                    : '',
              });

              obj.keyValue.push({
                key: 'Status',
                value:
                  respObj.resource.contained &&
                  respObj.resource.contained[0].status
                    ? respObj.resource.contained[0].status
                    : '',
              });

              obj.keyValue.push({ key: 'Dosage', value: obj.subtitle });

              obj.keyValue.push({
                key: 'Dosage Quantity',
                value:
                  respObj.resource.dosage &&
                  respObj.resource.dosage[0] &&
                  respObj.resource.dosage[0].doseAndRate
                    ? respObj.resource.dosage[0].doseAndRate[0].doseQuantity
                        .value
                    : '',
              });
              medicationData.push(obj);
            });
          }

          break;
        case 'MedicationDispense':
          if (responseData.entry != null && responseData.entry.length > 0) {
            responseData.entry.forEach((respObj) => {
              let obj: any = {};

              obj.title =
                respObj.resource.contained && respObj.resource.contained[0].code
                  ? respObj.resource.contained[0].code.coding[0]
                  : '';

              obj.subtitle =
                respObj.resource.dosage && respObj.resource.dosage[0].text
                  ? respObj.resource.dosage[0].text
                  : '';

              obj.refill =
                respObj.resource.quantity && respObj.resource.quantity.value
                  ? respObj.resource.quantity.value +
                    ' ' +
                    respObj.resource.quantity.code
                  : '';

              let serachRes = this.filter(
                'id',
                'refillsRemaining',
                respObj.resource.extension ? respObj.resource.extension : []
              );

              obj.refillsRemaning =
                serachRes && serachRes.length > 0
                  ? serachRes[0].valueString
                  : '';

              obj.date = respObj.resource.whenHandedOver;
              if(obj.date!= null && obj.date != ''){
                obj.date = moment(obj.date);
              }
              obj.keyValue = [];
              serachRes = this.filter(
                'id',
                'facility',
                respObj.resource.extension ? respObj.resource.extension : []
              );
              obj.facility =
                serachRes && serachRes.length > 0
                  ? serachRes[0].valueString
                  : '';

              serachRes = this.filter(
                'id',
                'facilityKey',
                respObj.resource.extension ? respObj.resource.extension : []
              );
              obj.facilityKey =
                serachRes && serachRes.length > 0
                  ? serachRes[0].valueString
                  : '';

              serachRes = this.filter(
                'id',
                'sourceFacility',
                respObj.resource.extension ? respObj.resource.extension : []
              );

              obj.keyValue.push({
                key: 'sourceFacility',
                value:
                  serachRes && serachRes.length > 0
                    ? serachRes[0].valueString
                    : '',
              });

              obj.keyValue.push({
                key: 'Status',
                value:
                  respObj.resource.contained &&
                  respObj.resource.contained[0].status
                    ? respObj.resource.contained[0].status
                    : '',
              });

              obj.keyValue.push({ key: 'Dosage', value: obj.subtitle });

              obj.keyValue.push({
                key: 'Dosage Quantity',
                value:
                  respObj.resource.dosage &&
                  respObj.resource.dosage[0] &&
                  respObj.resource.dosage[0].doseAndRate
                    ? respObj.resource.dosage[0].doseAndRate[0].doseQuantity
                        .value
                    : '',
              });

              medicationData.push(obj);
            });
          }
          break;
      }
    }
    medicationData.sort(function(a:any,b:any){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return b.date - a.date;
    });
    return medicationData;
  }

  filter(key, value, array) {
    let result = array.filter(function (item) {
      if (item[key] == value) {
        return item;
      }
    });
    return result;
  }
}
