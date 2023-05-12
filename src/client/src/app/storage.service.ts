import { Injectable,Inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable, from } from 'rxjs';
import { Platform } from '@ionic/angular';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private token: string
  constructor(
    private storage: Storage,
    private platform: Platform) {
    this.init();
  }

  async init() {
    await this.storage.create();
  }

  setStorage(key: string, value: any) {
    if (
      (this.platform.is('android') ||
        this.platform.is('ios') ||
        this.platform.is('iphone')) &&
      this.platform.is('mobile') &&
      !this.platform.is('mobileweb')
    ) {
      return from(this.storage.set(key, value));
    } else if (key == 'token') {
      this.token = JSON.stringify(value)
      return from(this.storage.set(key, ''));
    } else {
      return from(this.storage.set(key, value));
    }
  }

  getStorage(key: string): Observable<any> {
    return from(this.storage.get(key));
  }

  removeStorage(key: string) {
    return from(this.storage.remove(key));
  }
  getToken(): string{
    return this.token;
  }
}
