import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { MyRecordsService } from '../myrecords.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/utils/toast.service';
import { UserService } from 'src/app/profile/user.service';
import { User } from 'src/app/profile/user';
import { IonInfiniteScroll } from '@ionic/angular';
@Component({
  selector: 'my-records-category-list',
  templateUrl: './my-records-category-list.page.html',
  styleUrls: ['./my-records-category-list.page.scss'],
})
export class MyRecordsCategoryListPage implements OnInit, OnDestroy {
  category: any = {};
  showSearch: any;
  headerProps: any;
  list: any;
  header: any;
  dataLoaded: boolean;
  viewMonthSelected: string;
  subscriber: Subscription;
  pageCount: Number = 100;
  offset: Number = 0;
  searchTextSubscription: Subscription;
  isHeader: any;
  user: User;
  userDataLoaded: boolean;
  mainDataList: any = [];
  total: any = 0;
  payloadLoaded: boolean;
  userSubscription: Subscription;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  constructor(
    public navCtrl: NavController,
    private myrecordsService: MyRecordsService,
    private router: Router,
    private toastService: ToastService,
    private userService: UserService
  ) {}
  ngOnInit() {}

  ionViewWillEnter() {
    this.isHeader = false;

    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = user;
        this.userDataLoaded = true;
        this.loadPayload(this.payloadLoaded);
        this.payloadLoaded = true;
      }
    });
  }
  loadPayload(payloadLoaded: boolean) {
    // this.category = {};
    if (!payloadLoaded) {
      this.category = this.myrecordsService.getSelectedCategory();

      this.headerProps = {
        showBackButton: true,
        title: this.category.type,
        placeholder: 'Search all medications',
        showSearchBar: true,
        serchText: this.category['searchText'],
        // medicalSearch: true,
      };

      this.fetchClinicalDataByCategory(null);
    }
  }

  fetchClinicalDataByCategory(event, clearData = false) {
    this.subscriber = this.myrecordsService
      .fetchClinicalDataByCategory({
        pageCount: this.pageCount,
        offset: this.offset,
        categoryName: this.category.type,
        // globalPatientId: this.user.fhirPatientID,
        searchText: this.category.searchText,
      })
      .subscribe((resList: any) => {
        if (resList != null) {
          this.dataLoaded = true;
          if (clearData) {
            this.mainDataList = [];
          }
          if (this.category.type == 'Medication') {
            this.mainDataList = this.mainDataList.concat(resList);
            this.total = resList[0].response.total + resList[1].response.total;
          } else {
            this.mainDataList = this.mainDataList.concat(resList.entry);
            this.total = resList.total;
          }

          if (this.total > 0) {
            const groupedList = this.myrecordsService.groupByKey(
              this.category.type == 'Medication'
                ? this.mainDataList
                : this.mainDataList,
              this.category.type
            );
            if (
              event != null &&
              this.total <= this.offset.valueOf() + this.pageCount.valueOf()
            ) {
              event.target.disabled = true;
            } else if (event != null) {
              event.target.complete();
            }
            this.list = groupedList;
            this.header = Object.keys(groupedList);
          }
        } else {
          this.dataLoaded = true;
        }
      });
    this.ngOnInit();
  }
  goBack() {
    this.navCtrl.pop();
  }
  viewMonth(key) {
    if (this.viewMonthSelected != null && this.viewMonthSelected === key) {
      this.viewMonthSelected = null;
    } else this.viewMonthSelected = key;
  }

  ionViewWillLeave() {
    if (this.searchTextSubscription) {
      this.searchTextSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.category) {
      this.category = [];
    }
  }
  filterList(key) {
    if (key == this.viewMonthSelected) return this.list[key];
    else return this.list[key].filter((x, index) => index < 2);
  }
  onclick(item: any) {
    this.myrecordsService.setSelectedClinicalDetails(item);
    this.router.navigate(['/tabs/myRecords/my-records-details']);
  }
  ngOnDestroy() {
    if (this.subscriber) this.subscriber.unsubscribe();
  }
  onSearchTextChanged(searchText: string) {
    this.category.searchText = searchText;
    this.fetchClinicalDataByCategory(null, true);
  }

  loadData(event) {
    if (this.total > this.offset.valueOf() + this.pageCount.valueOf()) {
      this.offset = this.offset.valueOf() + this.pageCount.valueOf();
      this.fetchClinicalDataByCategory(event);
    } else {
      event.target.disabled = true;
    }
  }
}
