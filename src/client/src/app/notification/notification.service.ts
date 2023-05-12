import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../profile/user';
import { apiUrlConfig } from '../utils/constants';

import { Notification } from './notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private http: HttpClient) {}

  getNotifications(
    userId: string,
    page: number = 0,
    size: number = 10
  ): Observable<Notification[]> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('size', size.toString());
    return this.http.get<Notification[]>(
      `${apiUrlConfig.users}/${userId}/notifications`,
      { params }
    );
  }

  getNotification(id: string): Observable<Notification> {
    return this.http.get<Notification>(`${apiUrlConfig.notifications}/${id}`);
  }

  markNotificationAsRead(
    userId: string,
    requestPayload: object
  ): Observable<User> {
    return this.http.put<User>(
      `${apiUrlConfig.users}/${userId}/markNotificationAsRead`,
      {
        ...requestPayload,
      }
    );
  }
}
