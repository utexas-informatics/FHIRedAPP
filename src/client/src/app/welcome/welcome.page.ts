import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';
import { Platform } from '@ionic/angular';
import { UserService } from '../profile/user.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {
  public showScreen:Boolean=false
  constructor(
    private storageService: StorageService,
    private router: Router,
    private platform: Platform,
    private userService:UserService
  ) {}
  ionViewWillEnter() {
    // if (
    //   (this.platform.is('android') ||
    //     this.platform.is('ios') ||
    //     this.platform.is('iphone')) &&
    //   this.platform.is('mobile') &&
    //   !this.platform.is('mobileweb')
    // ) {
    // } else {
    //   //web application
    //   this.router.navigate(['/invite/inviteCodeAdd']);
    // }
  }
  public isEndSlider: any;
  ngOnInit() {
    setTimeout(() => {
      this.storageService.getStorage('userInfo').subscribe(async (data) => {
        if (data &&  !this.userService.isLoginMagicLink()) {
          
          if (!data?.isNewUser) {
            let userEmail = await this.storageService
              .getStorage('userEmail')
              .toPromise();
            sessionStorage.setItem('userEmail', userEmail);
            
            this.router.navigate(['loginPassword']);
            
          }
        } else {
          this.storageService.getStorage('openOnce').subscribe((data) => {
            if (data) {
              if (data?.openOnce) {
                this.router.navigate(['invite']);
              }
            }
          });
        }
        this.showScreen=true;
      });
    }, 1000);
   
    // this.isEndSlider = false;
  }

  onslideEnd(data) {
    this.isEndSlider = data;
  }
}
