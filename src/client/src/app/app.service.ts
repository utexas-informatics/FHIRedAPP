import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrlConfig } from './utils/constants';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private http: HttpClient) {}

  getLeapConsentPolicy(): Observable<string> {
    return this.http.get<string>(`${apiUrlConfig.getLeapConsentPolicy}`, {
      headers: { skip: 'true' },
    });
  }
}
