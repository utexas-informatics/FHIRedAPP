import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { App } from '../app';
import { Platform } from '@ionic/angular';
@Component({
  selector: 'app-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.scss'],
})
export class ConsentComponent implements OnInit {
  @Input() app: App;
  isConsentPolicyCollapsed = false;
  isEngLanguageSelected:any=true;
  consentPolicyTobeLoaded:any=''
  public isIOS:boolean
  constructor(private modalController: ModalController, private platform:Platform) {

  }

  ngOnInit() {
    this.consentPolicyTobeLoaded = this.isEngLanguageSelected?  this.app.consentPolicy_en: this.app.consentPolicy_sp
      if (
        (
          this.platform.is('ios') ||
          this.platform.is('iphone')) &&
        this.platform.is('mobile')) {
        this.isIOS=true;
      } else {
        //web application
        this.isIOS=false;
      }
  }

  dismiss(_: any, isAccepted: boolean) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      isAccepted,
    });
  }
  setSelected (){
    this.isEngLanguageSelected=!this.isEngLanguageSelected;
    this.consentPolicyTobeLoaded = this.isEngLanguageSelected?  this.app.consentPolicy_en: this.app.consentPolicy_sp
  }
}
