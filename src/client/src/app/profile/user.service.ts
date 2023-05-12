import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { apiBaseUrl, apiUrlConfig } from '../utils/constants';
import { User, NewUser, VerifyUser } from './user';
import { App } from '../apps/app';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../utils/toast.service';
import { StorageService } from '../storage.service';
import { LoadingController, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public activeUser = {};
  // private emptyUser: User = {} as User;
  private userSubject$ = new BehaviorSubject<User>(null);
  private newUserSubject$ = new BehaviorSubject<NewUser>(null);
  private forgotSubject$ = new BehaviorSubject<Boolean>(null);
  private authState$ = new BehaviorSubject<boolean>(false);
  private userVerificationSubject$ = new BehaviorSubject<VerifyUser>(null);
  private isAppOpenedSubject$ = new BehaviorSubject<Boolean>(null);
  private loginResponse$ = new BehaviorSubject<any>(null);
  private userData: User;
  private isLoginWithMagicLink: Boolean;
  private loggedOut: Boolean=false;
  loadingVar;
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService,
    private storageService: StorageService,
    private platform: Platform,
    private loadingController: LoadingController
  ) {
    /* const userFromSessionStorage = sessionStorage.getItem('user');
    if (userFromSessionStorage) {
      const user: User = JSON.parse(userFromSessionStorage);
      this.setUser(user);
    } */
  }

  get isAppOpened$(): Observable<Boolean> {
    return this.isAppOpenedSubject$.asObservable();
  }

  setIsAppOpened(flag: boolean): void {
    this.isAppOpenedSubject$.next(flag);
  }
  get user$(): Observable<User> {
    return this.userSubject$.asObservable();
  }
  getUser() {
    return this.userData;
  }
  setUser(user: User): void {
    this.userSubject$.next({ ...user });
    this.userData = { ...user };
    // sessionStorage.setItem('user', JSON.stringify(this.userSubject$.value));
  }

  setNewUser(user: NewUser): void {
    this.newUserSubject$.next({ ...user });
  }

  get newUser$(): Observable<NewUser> {
    return this.newUserSubject$.asObservable();
  }

  setForgot(forgot: Boolean): void {
    this.forgotSubject$.next(forgot);
  }

  get forgot$(): Observable<Boolean> {
    return this.forgotSubject$.asObservable();
  }

  clear(): void {
    this.userSubject$.next(null);
    this.newUserSubject$.next(null);
    // sessionStorage.clear();
  }

  clearUser(): void {
    this.userSubject$.next(null);
    // sessionStorage.clear();
  }

  fetchUserByEmailId(emailId, skip = 'true', password = ''): void {
    this.http
      .get<User>(`${apiUrlConfig.getUserByEmailId}/${emailId}`, {
        headers: skip === 'true' ? { skip } : {},
      })
      .pipe(
        catchError((err) => {
          if (this.getloadingStatus()) this.dismissLoading();
          if (
            err.error.status === 500 &&
            err.error.message.includes('User not found')
          ) {
            this.setNewUser({ email: emailId });
            this.router.navigate(['/emailVerification']);
          } else if (
            err.error.status === 500 &&
            err.error.message.includes('User not invited')
          ) {
            this.toastService.presentToastWithClose({
              type: 'warning',
              message:
                'Invalid Invite code. Please contact Study Recruiter for further help',
            });
            this.router.navigate(['/invite']);
          } else if (
            err.error.status === 500 &&
            err.error.message.includes('User not verified')
          ) {
            this.toastService.presentToastWithClose({
              type: 'warning',
              message:
                'Your account is not activated yet. Please provide an invite code or contact study coordinator for further help',
            });
            this.router.navigate(['/invite']);
          } else if (
            err.error.status === 500 &&
            err.error.message.includes('User not accepted consent')
          ) {
            this.toastService.presentToastWithClose({
              type: 'warning',
              message:
                'Invalid Invite code. Please contact Study Recruiter for further help.',
            });
            this.router.navigate(['/invite']);
          }
          return throwError(err);
        })
      )
      .subscribe((apiUser) => {
        if (this.getloadingStatus()) this.dismissLoading();
        if (
          ['PendingApproval', 'Locked', 'Inactive'].includes(apiUser.status)
        ) {
          this.toastService.presentToastWithClose({
            type: 'warning',
            message: `Your account is in ${
              apiUser.status == 'PendingApproval' ? 'Pending' : apiUser.status
            } state. Please reach out to Study Coordinator for further help.`,
          });
        } else {
          this.activeUser = apiUser;
          this.setUser({ ...apiUser });
          this.setNewUser({ email: emailId });
          this.storageService.setStorage(
            'userBioMetrciSetting',
            this.userData.isBiometricEnabled ? 'yes' : ''
          );
          if (
            (this.platform.is('android') ||
              this.platform.is('ios') ||
              this.platform.is('iphone')) &&
            this.platform.is('mobile') &&
            !this.platform.is('mobileweb') &&
            emailId != '' &&
            password != ''
          ) {
            this.storageService.setStorage(
              'key',
              btoa(`${emailId}:${password}`)
            );
          }
        }
      });
  }

  createSignedupUser(payload: object): Observable<User> {
    return this.http.post<User>(apiUrlConfig.users, payload, {
      headers: { skip: 'true' },
    });
  }

  fetchUserById(userId): void {
    this.http
      .get<User>(`${apiUrlConfig.users}/${userId}`)
      .subscribe((apiUser) => this.setUser({ ...apiUser }));
  }

  login(loginInfo: string): Observable<User> {
    return this.http
      .post<User>(
        `${apiUrlConfig.users}/login`,
        {},
        {
          headers: { Authorization: `basic ${loginInfo}`, skip: 'true' },
        }
      )
      .pipe(
        catchError((err) => {
          if (err.error.status != 200) {
            this.toastService.presentToast({
              type: 'error',
              message: err.error.message,
            });
          }
          this.setLoginResponse({ isLogin: true });
          return throwError(err);
        })
      );
  }

  getMyApps(userId): Observable<App[]> {
    return this.http.get<App[]>(`${apiUrlConfig.users}/${userId}/apps`);
  }

  updateProfile(
    userId: string,
    requestPayload: object,
    skip = 'false'
  ): Observable<User> {
    return this.http.put<User>(
      `${apiUrlConfig.users}/${userId}`,
      {
        ...requestPayload,
      },
      { headers: skip === 'true' ? { skip } : {} }
    );
  }

  activateSignup(
    userId: string,
    requestPayload: object,
    skip = 'false'
  ): Observable<User> {
    return this.http.put<User>(
      `${apiUrlConfig.users}/activateSignup/${userId}`,
      {
        ...requestPayload,
      },
      { headers: skip === 'true' ? { skip } : {} }
    );
  }

  getUserByEmailId(emailId: string): Observable<User> {
    return this.http.get<User>(`${apiUrlConfig.getUserByEmailId}/${emailId}`, {
      headers: { skip: 'true' },
    });
  }

  getUserByEVC(code: string): Observable<User> {
    return this.http.get<User>(`${apiUrlConfig.getUserByEVC}/${code}`, {
      headers: { skip: 'true' },
    });
  }

  signupUser(signupInfo: string): Observable<User> {
    return this.http.post<User>(
      `${apiUrlConfig.users}/signup`,
      {},
      {
        headers: { Authorization: `basic ${signupInfo}`, skip: 'true' },
      }
    );
  }

  setNewPassword(signupInfo: string): Observable<User> {
    return this.http.post<User>(
      `${apiUrlConfig.users}/setNewPassword`,
      {},
      {
        headers: { Authorization: `basic ${signupInfo}`, skip: 'true' },
      }
    );
  }

  authorizeUser() {
    this.authState$.next(true);
  }

  unAuthorizeUser() {
    this.authState$.next(false);
  }

  isAuthenticated() {
    return this.authState$.value;
  }
  setUserVerificationStatus(userVerificationStatus: VerifyUser): void {
    this.userVerificationSubject$.next({ ...userVerificationStatus });
    // sessionStorage.setItem('user', JSON.stringify(this.userSubject$.value));
  }

  get userVerificationStatus$(): Observable<VerifyUser> {
    return this.userVerificationSubject$.asObservable();
  }

  verifyUser(emailId, skip = 'true'): void {
    this.http
      .post<VerifyUser>(
        `${apiUrlConfig.verifyUser}`,
        { emailId: emailId },
        {
          headers: skip === 'true' ? { skip } : {},
        }
      )
      .pipe(
        catchError((err) => {
          if(this.getloadingStatus())
           this.dismissLoading();
          if (
            err.error.status === 500 &&
            err.error.message.includes('User not found')
          ) {
            this.setForgot(false);
            this.setNewUser({ email: emailId });
            this.router.navigate(['/emailVerification']);
          } else if (
            err.error.status === 500 &&
            err.error.message.includes('User not invited')
          ) {
            this.toastService.presentToastWithClose({
              type: 'warning',
              message:
                'We could not verify the entered email address. Please check again or contact Study Coordinator for further help',
            });
            this.router.navigate(['/invite']);
          } else if (
            err.error.status === 500 &&
            err.error.message.includes('User not verified')
          ) {
            this.toastService.presentToastWithClose({
              type: 'warning',
              message:
                'Redirecting to invite code verification as invitation is not verified.',
            });
            this.router.navigate(['/invite']);
          } else if (
            err.error.status === 500 &&
            err.error.message.includes('User not accepted consent')
          ) {
            this.toastService.presentToastWithClose({
              type: 'warning',
              message:
                'Redirecting to invite code verification as consent is not accepted.',
            });
            this.router.navigate(['/invite']);
          }
          return throwError(err);
        })
      )
      .subscribe((verificationStatus) => {
        if (
          ['PendingApproval', 'Locked', 'Inactive'].includes(
            verificationStatus.status
          )
        ) {
          this.toastService.presentToastWithClose({
            type: 'warning',
            message: `Your account is in ${
              verificationStatus.status == 'PendingApproval'
                ? 'Pending'
                : verificationStatus.status
            } state.  Please reach out to Study Coordinator for further help.`,
          });
        } else {
          this.setUserVerificationStatus({ ...verificationStatus });
          this.setNewUser({ email: emailId });
        }
      });
  }

  logout() {
    return this.http.post(`${apiUrlConfig.logout}`, {});
  }
  verifyAndSendForgot(emailId, skip = 'true') {
    return this.http
      .get(`${apiUrlConfig.forgotPassword}/${emailId}`, {
        headers: skip === 'true' ? { skip } : {},
      })
      .pipe(
        catchError((err) => {
          if (
            err.error.status === 500 &&
            err.error.message.includes('User not found')
          ) {
            this.setForgot(false);
            this.setNewUser({ email: emailId });
            this.toastService.presentToastWithClose({
              type: 'warning',
              message: 'Account not found.',
            });
          }
          return throwError(err);
        })
      );
  }
  getBiometricAccessToken(refresh_token,authType,userEmail) {
    return this.http.post(
      `${apiUrlConfig.getBiometricAccessToken}`,
      {authType:authType,email:userEmail},
      {
        headers: { Authorization: `bearer ${refresh_token}`, skip: 'true' },
      }
    );
  }

  loginWithMagicLink() {
    const email = sessionStorage.getItem('userEmail');
    return this.http.post(
      `${apiUrlConfig.loginWithMagicLink}`,
      {
        email: email,
      },
      { headers: { skip: 'true' } }
    );
  }
  getTokenByHashkey(hashkey) {
    return this.http.get(`${apiUrlConfig.getTokenByHashkey}/${hashkey}`);
  }

  get IsloginResponse$(): Observable<Boolean> {
    return this.loginResponse$.asObservable();
  }

  setLoginResponse(isResponse: any): void {
    return this.loginResponse$.next({ ...isResponse });
  }

  async loading() {
    this.loadingVar = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      spinner: 'lines',
    });
    await this.loadingVar.present();
  }
  dismissLoading() {
    if (this.getloadingStatus) this.loadingVar.dismiss();
  }
  getloadingStatus() {
    return this.loadingVar;
  }
  isLoginMagicLink():Boolean{
    return this.isLoginWithMagicLink;
  }
  setLoginWithMagicLonk(vlaue:Boolean){
    this.isLoginWithMagicLink=vlaue;
  }
  getLoggedOut():Boolean{
    return this.loggedOut;
  }
  setLoggedOut(vlaue:Boolean){
    this.loggedOut=vlaue;
  }
}
