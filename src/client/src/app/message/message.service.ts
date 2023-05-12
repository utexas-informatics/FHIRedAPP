import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { apiUrlConfig } from '../utils/constants';
import { App } from '../apps/app';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../utils/toast.service';
@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messageUnreadCount$ = new BehaviorSubject<any>(null);
  private messageNotify$ = new BehaviorSubject<any>(null);

  public activeChat;
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {
    //  TODO : Remove Below Line
    // this.activeChat = {
    //   participants: {
    //     sender: { id: '6090051d3263f959f489d5e7', name: 'Dr. Anjum Khurshid' },
    //     recipient: { id: '5ff40edee62fe27178eab165', name: 'Balwant Padwal' },
    //   },
    // };
  }

  get count$(): Observable<object> {
    return this.messageUnreadCount$.asObservable();
  }

  setCount(count: object): void {
    this.messageUnreadCount$.next(count);
  }

  get notifyMessage$(): Observable<object> {
    return this.messageNotify$.asObservable();
  }

  setNotifyMessage(): void {
    this.messageNotify$.next("new message");
  }

  geThreads(userId, skip = 0, appId = null, limit = 20): Observable<any> {
    if (appId) {
      return this.http.get<any>(
        `${
          apiUrlConfig.messages
        }?${`userId=${userId}&appId=${appId}&skip=${skip}&limit=${limit}`}`
      );
    } else {
      return this.http.get<any>(
        `${
          apiUrlConfig.messages
        }?${`userId=${userId}&skip=${skip}&limit=${limit}`}`
      );
    }
  }

  searchThreads(
    searchText,
    userId,
    skip = 0,
    appId = null,
    limit = 20
  ): Observable<any> {
    if (appId) {
      return this.http.get<any>(
        `${
          apiUrlConfig.messages
        }titleSearch?${`search=${searchText}&userId=${userId}&appId=${appId}&skip=${skip}&limit=${limit}`}`
      );
    }
    return this.http.get<any>(
      `${
        apiUrlConfig.messages
      }titleSearch?${`search=${searchText}&userId=${userId}&skip=${skip}&limit=${limit}`}`
    );
  }

  unreadCount(userId): void {
    this.http
      .get<any>(`${apiUrlConfig.messages}unreadCount?${`userId=${userId}`}`)
      .subscribe((res) => {
        this.setCount(res);
      });
  }

  getParticipants(threadId, userId): Observable<any> {
    return this.http.get<any>(
      `${apiUrlConfig.messages}${threadId}/participants?${`userId=${userId}`}`
    );
  }

  getAppList(): Observable<any> {
    return this.http.get<any>(`${apiUrlConfig.apps}/list`);
  }

  getChats(threadId, senderId, recipientId, skip = 0, limit = 20) {
    return this.http.get<any>(
      `${
        apiUrlConfig.messages
      }${threadId}?${`senderId=${senderId}&recipientId=${recipientId}&skip=${skip}&limit=${limit}`}`
    );
  }
  sendMessage(threadId, payload, skip = 0, limit = 20, appId) {
    return this.http.put<any>(
      `${
        apiUrlConfig.messages
      }${threadId}?${`skip=${skip}&limit=${limit}&appId=${appId}`}`,
      payload
    );
  }
  markAsRead(threadId, recipientId, senderId) {
    return this.http.put<any>(
      `${
        apiUrlConfig.messages
      }${threadId}/markAsRead?${`recipientId=${recipientId}&senderId=${senderId}`}`,
      {}
    );
  }
}
