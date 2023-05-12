import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { User } from '../profile/user';
import { UserService } from '../profile/user.service';
import { LoginOptionsModalComponent } from './login-options-modal/login-options-modal.component';

@Component({
  selector: 'app-login-options',
  templateUrl: './login-options.page.html',
  styleUrls: ['./login-options.page.scss'],
})
export class LoginOptionsPage implements OnInit, OnDestroy {
  user: User;
  userSubscription: Subscription;
  loginOption: string;
  constructor(
    private router: Router,
    private userService: UserService,
    private modalController: ModalController
  ) {
    this.loginOption = 'Password';
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = { ...user };
      }
    });
  }

  onLoginViaOptionClick() {
    this.userService.clearUser();
    switch (this.loginOption) {
      // TBD add case for biometric
      case 'Password':
        this.router.navigate(['/loginPassword']);
        break;

      case 'Email Link':
        this.router.navigate(['/loginEmailLink']);
        break;

      default:
        break;
    }
  }

  onSwitchMethodClick() {
    this.presentModal();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: LoginOptionsModalComponent,
      cssClass: 'login-options-modal-styles',
      componentProps: {
        loginOption: this.loginOption,
      },
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (
        dataReturned !== null &&
        dataReturned.data &&
        dataReturned.data.loginOption !== this.loginOption
      ) {
        this.loginOption = dataReturned.data.loginOption;
      }
    });
    return await modal.present();
  }

  onSwitchAccount() {
    this.userService.clear();
    this.router.navigate(['/loginSignup']);
  }

  ionViewWillLeave() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {}
}
