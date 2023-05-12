import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../profile/user';
import { UserService } from '../profile/user.service';
import { ToastService } from '../utils/toast.service';

function nameValidator(control: FormControl): ValidationErrors | null {
  const trimmedValue = control.value ? control.value.trim() : control.value;
  return trimmedValue ? null : { required: true };
}
function genderOtherValidator(formGroup: FormGroup): ValidationErrors | null {
  const trimmedGenderOther = formGroup.get('genderOther').value
    ? formGroup.get('genderOther').value.trim()
    : formGroup.get('genderOther').value;
  if (formGroup.get('gender').value === 'Other' && !trimmedGenderOther) {
    return { invalidGenderOther: true };
  } else {
    return null;
  }
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  profileForm: FormGroup;
  defaultDate = '1987-06-30';
  isSubmitted = false;
  user: User;
  userSubscription: Subscription;

  constructor(
    private router: Router,
    public formBuilder: FormBuilder,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = { ...user };
        this.generateForm();
      }
    });
  }

  generateForm() {
    this.profileForm = this.formBuilder.group(
      {
        firstName: new FormControl(this.user.firstName, [
          Validators.required,
          Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/),
        ]),
        lastName: new FormControl(this.user.lastName, [
          Validators.required,
          Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/),
        ]),
        gender: new FormControl(this.user.gender, [Validators.required]),
        genderOther: new FormControl(this.user.genderOther),
        birthday: new FormControl(this.user.birthday, [
          Validators.required,
          this.validateAge,
        ]),
        phoneNumberPrimary: new FormControl(this.user.phoneNumberPrimary, [
          Validators.required,
          Validators.pattern(
            /^\s*(?:\+?(\d{0}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
          ),
        ]),
        phoneNumberSecondary: new FormControl(this.user.phoneNumberSecondary, [
          Validators.pattern(
            /^\s*(?:\+?(\d{0}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
          ),
        ]),
        // 5+4 digit zip code - "12345", "12345-1234"
        zip: new FormControl(this.user.zip, [
          Validators.required,
          Validators.pattern(/^(?:\d{5}(?:-\d{4})?)?$/),
        ]),
      },
      {
        validators: [genderOtherValidator],
      }
    );
  }

  getDate(e) {
    const date = new Date(e.target.value).toISOString();
    // .substring(0, 10);
    this.profileForm.get('birthday').setValue(date, {
      onlyself: true,
    });
  }

  validateAge(control) {
    if (control.value) {
      var birthday = +new Date(control.value);
      let age = ~~((Date.now() - birthday) / 31557600000);
      return age < 18 ? { invalidAge: true } : null;
    } else {
      return null;
    }
  }

  get errorControl() {
    return this.profileForm.controls;
  }

  submitForm() {
    this.isSubmitted = true;
    if (!this.profileForm.valid) {
      this.toastService.presentToastWithClose({
        type: 'warning',
        message: 'Please fill in all required fields',
      });
      return false;
    } else {
      this.userService
        .updateProfile(this.user._id, {
          ...this.profileForm.value,
          firstName: this.profileForm.value.firstName
            .trim()
            .split(' ')
            .map((x) => {
              return x.length > 0
                ? x.charAt(0).toUpperCase() + x.substr(1).toLowerCase()
                : x;
            })
            .join(' '),
          lastName: this.profileForm.value.lastName
            .trim()
            .split(' ')
            .map((x) => {
              return x.length > 0
                ? x.charAt(0).toUpperCase() + x.substr(1).toLowerCase()
                : x;
            })
            .join(' '),
          genderOther:
            this.profileForm.value.gender == 'Other'
              ? this.profileForm.value.genderOther
                  .trim()
                  .split(' ')
                  .map((x) => {
                    return x.length > 0
                      ? x.charAt(0).toUpperCase() + x.substr(1).toLowerCase()
                      : x;
                  })
                  .join(' ')
              : null,
          birthday: this.profileForm.value.birthday.substring(0, 10),
        })
        .subscribe((response: User) => {
          this.userService.setUser({ ...response });
          this.toastService.presentToastWithClose({
            type: 'success',
            message: `Profile updated successfully!`,
          });
          this.router.navigate(['/tabs']);
        });
    }
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
