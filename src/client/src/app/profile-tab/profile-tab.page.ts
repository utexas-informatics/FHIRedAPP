import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { Subscription } from 'rxjs';
import { User } from '../profile/user';
import { UserService } from '../profile/user.service';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-profile-tab',
  templateUrl: './profile-tab.page.html',
  styleUrls: ['./profile-tab.page.scss'],
})
export class ProfileTabPage implements OnInit, OnDestroy {
  user: User;
  userSubscription: Subscription;
  userupdateSubscription: Subscription;
  userBiometricSetting:boolean;
  userBiometricSettingStr:string;
  showBioMetricOption:string=null;

  constructor(private userService: UserService, private router: Router,
    private storageService: StorageService,
    private faio: FingerprintAIO) {}

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = { ...user };
      }
    });
    this.storageService.getStorage('userBioMetrciSetting').subscribe((data) => {
      this.userBiometricSettingStr=data;
        this.userBiometricSetting =this.userBiometricSettingStr?.length>0?true:false;
    });
    this.isFingerPrintAvailable()
  }

  async isFingerPrintAvailable (){
    this.showBioMetricOption = await this.faio.isAvailable();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.userupdateSubscription) {
      this.userupdateSubscription.unsubscribe();
    }
  }
  setBiometricEvent(isBiometricEnabled){
    this.userBiometricSettingStr?.length>0? this.userBiometricSettingStr='':this.userBiometricSettingStr='yes'
    this.storageService.setStorage('userBioMetrciSetting',  this.userBiometricSettingStr);
    this.user.isBiometricEnabled=this.userBiometricSettingStr?.length>0?true:false;

    this.userupdateSubscription = this.userService
    .updateProfile(this.user._id, {isBiometricEnabled:this.user.isBiometricEnabled})
    .subscribe((response: User) => {
      
    });
  }
}
