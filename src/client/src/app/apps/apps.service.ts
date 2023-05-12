import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../profile/user';
import { Platform } from '@ionic/angular';
import { apiUrlConfig } from '../utils/constants';
import { App } from './app';

@Injectable({
  providedIn: 'root',
})
export class AppsService {
  private url = null;
  private isMyAppSubject$ = new BehaviorSubject<Boolean>(false);

  constructor(private http: HttpClient,   private platform: Platform) {}
  getIsMyAppStatus$(): Observable<Boolean> {
    return this.isMyAppSubject$.asObservable();
  }

  setIsMyAppStatus(IsMyApp: boolean): void {
    this.isMyAppSubject$.next(IsMyApp);
  }
  getApps(): Observable<App[]> {
    return this.http.get<App[]>(apiUrlConfig.apps);
  }

  getApp(id: string): Observable<App> {
    return this.http.get<App>(`${apiUrlConfig.apps}/${id}`);
  }

  acceptConsent(userId: string, requestPayload: object): Observable<User> {
    return this.http.put<User>(
      `${apiUrlConfig.users}/${userId}/acceptConsent`,
      {
        ...requestPayload,
      }
    );
  }

  revokeConsent(userId: string, requestPayload: object): Observable<User> {
    return this.http.put<User>(
      `${apiUrlConfig.users}/${userId}/revokeConsent`,
      {
        ...requestPayload,
      }
    );
  }
  setURL(url: string) {
    this.url = url;
  }
  getURL() {
    return this.url;
  }
  isMobile(){
    if (
      (this.platform.is('android') ||
        this.platform.is('ios') ||
        this.platform.is('iphone')) &&
      this.platform.is('mobile') &&
      !this.platform.is('mobileweb')
    ) {
      return true
    }else{
      return false
    }
  }
  getAppRedirectionUrl(appId: string): Observable<any> {
    return this.http.get<any>(
      `${apiUrlConfig.getAppRedirectionUrl}/${appId}`
    );
  }
}
