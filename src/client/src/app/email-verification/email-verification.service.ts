import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrlConfig } from '../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class EmailVerificationCodeService {
  constructor(private http: HttpClient) {}

  verifyEmailVerificationCode(requestPayload: object): Observable<boolean> {
    return this.http.put<boolean>(
      `${apiUrlConfig.verifyEmailVerificationCode}`,
      { ...requestPayload },
      {
        headers: { skip: 'true' },
      }
    );
  }
}
