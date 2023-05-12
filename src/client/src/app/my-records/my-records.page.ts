import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MyRecordsCategories } from './myrecords';
import { MyRecordsService } from './myrecords.service';
import { Subscription } from 'rxjs';
import { UserService } from '../profile/user.service';
import { User } from '../profile/user';

@Component({
  selector: 'app-my-records',
  templateUrl: './my-records.page.html',
  styleUrls: ['./my-records.page.scss'],
})
export class MyRecordsPage implements OnInit, OnDestroy {
  headerProps: any;
  user: User;
  clinicalCategories: any;
  subscriber: Subscription;
  dataLoaded: Boolean = false;
  isMatchProcess: Boolean = false;

  constructor(
    private router: Router,
    private myrecordsService: MyRecordsService,
    private userService: UserService
  ) {
    this.headerProps = {
      showBackButton: false,
      title: 'Your Health Records',
      placeholder: 'Search all health records',
      showSearchBar: true,
      medicalSearch: true,
    };
  }
  ngOnInit() {}

  ionViewWillEnter() {
    this.clinicalCategories = [
      {
        type: 'Vitals',
        image_url: 'vitals',
        description: 'Vitals',
      },
      {
        type: 'Lab Results',
        image_url: 'lab-results',
        description: 'Lab Results',
      },
      {
        type: 'Medication',
        image_url: 'medication',
        description: 'Medication',
      },
      {
        type: 'Diagnosis',
        image_url: 'disgnosis',
        description: 'Diagnosis',
      },
      {
        type: 'Visits',
        image_url: 'family-history',
        description: 'Visits',
      },
      {
        type: 'Procedures',
        image_url: 'last-appontments',
        description: 'Procedures',
      },
    ];
    this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = user;
        this.isMatchProcess =
          user && user.datavantMatchStatus === 'pending' ? false : true;
        if (user.datavantMatchStatus === 'matchFound') {
          this.dataLoaded = true;
          // if (!this.user.fhirPatientID) {
          //   // this.getFhiredAppPatientId();
          // } else {
          //   this.dataLoaded = true;
          // }
        }
      }
    });
  }

  ionViewWillLeave() {}

  gotoRecordsDetail(category: MyRecordsCategories) {
    this.myrecordsService.setSelectedCategory(category);
    this.router.navigate(['/tabs/myRecords/my-records-category-list']);

    // switch (category.type) {
    //   case 'Medication':
    //     break;
    //   case 'Vitals':

    //     break;

    //   case 'Lab Results':

    //     break;

    //   case 'Diagnosis':
    //     break;
    //   case 'Family History':
    //     break;
    //   case 'Last Appintments':
    //     break;
    // }
  }
  ngOnDestroy() {
    // if (this.subscriber) this.subscriber.unsubscribe();
  }
  onSearchTextChanged(searchText: string) {
    var search = searchText.split(' | in ');
    let category = {
      description: search[1],
      type: search[1],
      searchText: search[0],
    };
    this.myrecordsService.setSelectedCategory(category);
    setTimeout(() => {
      this.router.navigate(['/tabs/myRecords/my-records-category-list']);
    }, 300);
  }
  getFhiredAppPatientId() {
    this.subscriber = this.myrecordsService
      .fecthFhirPatientID({
        FHIRedAppPatientID: this.user._id,
      })
      .subscribe((response: any) => {
        if (response && response.fhirPatientId) {
          const newUser = { ...this.user };
          newUser.fhirPatientID = response.fhirPatientId;
          this.userService.setUser(newUser);
          this.dataLoaded = true;
        }
      });
  }
}
