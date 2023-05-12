import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

import { UserService } from '../profile/user.service';
import { User } from '../profile/user';
import { StorageService } from '../storage.service';
import { CookieService } from 'ngx-cookie-service';
import { Platform } from '@ionic/angular';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  user: User;
  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private cookieService: CookieService,
    private platform: Platform
  ) {
    this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = { ...user };
      }
    });
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return from(this.handle(req, next));
  }

  async handle(req: HttpRequest<any>, next: HttpHandler) {
    let platform = await this.storageService.getStorage('platform').toPromise();
    let token = await this.storageService.getStorage('token').toPromise();
   
   // check if token is null then get from in memory variable
    if (token == '' && this.storageService.getToken()) {
      token = JSON.parse(this.storageService.getToken());
    }

    const session_state =
      token && token['session_state']
        ? { session_state: token['session_state'] }
        : '';
        let authorization = {Authorization:''}

        // check if mobile application is there then send authorization header else it will be handled by cookies
        if (
          (this.platform.is('android') ||
            this.platform.is('ios') ||
            this.platform.is('iphone')) &&
          this.platform.is('mobile') &&
          !this.platform.is('mobileweb')
        ) {
          authorization.Authorization=
          token && token.access_token
            ?  `bearer ${token.access_token}` 
            : '';
       }

    if (!req.headers.get('skip')) {
      
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/json; charset=utf-8',
          accept: 'application/json',
          userid: this.user ? this.user._id : '',
          source: 'FhiredApp',
          platform: platform,
          ...authorization,
          ...session_state,
        },
        withCredentials: true
      });
    } else {
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/json; charset=utf-8',
          accept: 'application/json',
          userid: this.user ? this.user._id : '',
          source: 'FhiredApp',
          platform: platform,
          ...session_state,
        },
        withCredentials: true
      });
    }
    return next.handle(req).toPromise();
  }
}
