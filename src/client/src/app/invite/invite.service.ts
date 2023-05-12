import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrlConfig } from '../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class InviteCodeService {
  constructor(private http: HttpClient) {}

  // TBD remove skip from the header once auth implemented
  addInviteCode(payload: object): Observable<boolean> {
    return this.http.post<boolean>(
      `${apiUrlConfig.inviteCodes}`,
      { ...payload },
      {
        headers: { skip: 'true' },
      }
    );
  }

  getStatus(code: string): Observable<string> {
    return this.http.get<string>(
      `${apiUrlConfig.getInviteCodeStatus}/${code}`,
      {
        headers: { skip: 'true' },
      }
    );
  }

  update(code: string, payload: object): Observable<boolean> {
    return this.http.put<boolean>(
      `${apiUrlConfig.inviteCodes}/${code}`,
      { ...payload },
      {
        headers: { skip: 'true' },
      }
    );
  }

  updateDeclineStatus(code: string) {
    return this.http
      .post<boolean>(
        `${apiUrlConfig.declineAppConsent}`,
        { code },
        {
          headers: { skip: 'true' },
        }
      )
      .subscribe();
  }
}
