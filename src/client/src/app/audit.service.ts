import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiUrlConfig } from './utils/constants';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  constructor(private http: HttpClient) {}

  generateAudit(auditInfo) {
    this.http
      .post<string>(`${apiUrlConfig.generateAudit}`, auditInfo, {
        headers: { skip: 'true' },
      })
      .subscribe();
  }
}
