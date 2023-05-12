import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../profile/user';
import { UserService } from '../profile/user.service';
import { ToastService } from '../utils/toast.service';

@Component({
  selector: 'app-signup-activate',
  templateUrl: './signup-activate.page.html',
  styleUrls: ['./signup-activate.page.scss'],
})
export class SignupActivatePage implements OnInit {
  pathParams;
  user: User;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.pathParams = { ...params };
      if (this.pathParams && this.pathParams.code) {
        this.userService
          .getUserByEVC(this.pathParams.code)
          .pipe(
            catchError((err) => {
              if (
                err.error.status === 500 &&
                err.error.message.includes('User not found')
              ) {
                this.toastService.presentToast({
                  type: 'error',
                  message: err.error.message,
                });
              }
              return throwError(err);
            })
          )
          .subscribe((response) => {
            this.user = { ...response };
          });
      }
    });
  }

  onDecline() {
    this.userService
      .activateSignup(this.user._id, { status: 'Inactive' }, 'true')
      .subscribe((response) => {
        this.toastService.presentToastWithClose({
          type: 'success',
          message: `Profile status updated as ${response.status}.`,
        });
      });
  }

  onActivate() {
    this.userService
      .activateSignup(this.user._id, { status: 'Active' }, 'true')
      .subscribe((response) => {
        this.user = response;
        this.toastService.presentToastWithClose({
          type: 'success',
          message: `Profile status updated as ${response.status}.`,
        });
      });
  }
}
