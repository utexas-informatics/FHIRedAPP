import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-login-options-modal',
  templateUrl: './login-options-modal.component.html',
  styleUrls: ['./login-options-modal.component.scss'],
})
export class LoginOptionsModalComponent implements OnInit {
  @Input() loginOption: string;
  isConsentPolicyCollapsed = true;

  constructor(
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit() {}

  dismiss(doLogin: boolean) {
    if (doLogin) {
      this.loginViaOption();
      this.modalController.dismiss({
        loginOption: this.loginOption,
      });
    } else {
      this.modalController.dismiss();
    }
  }

  loginViaOption() {
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
}
