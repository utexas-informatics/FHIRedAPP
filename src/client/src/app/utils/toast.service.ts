import { Injectable } from '@angular/core';
import { ToastController, IonicSafeString } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  formatMessage(message, type) {
    switch (type) {
      case 'warning':
        return new IonicSafeString(
          `<div style="display: flex; align-items: center;padding:10px 0 10px 0"><ion-icon color="warning" style="margin-right: 8px;" name="warning-outline"></ion-icon>  <ion-text>${message}</ion-text></div>`
        );
      case 'success':
        return new IonicSafeString(
          `<div style="display: flex; align-items: center;padding:10px 0 10px 0"><ion-icon color="success" style="margin-right: 8px;" name="checkmark-circle-outline"></ion-icon>  <ion-text>${message}</ion-text></div>`
        );
      case 'error':
        return new IonicSafeString(
          `<div style="display: flex; align-items: center;padding:10px 0 10px 0"><ion-icon color="danger" style="margin-right: 8px;" name="alert-circle-outline"></ion-icon>  <ion-text>${message}</ion-text></div>`
        );
      default:
        return new IonicSafeString(
          `<div style="display: flex; align-items: center;padding:10px 0 10px 0"><ion-icon color="primary" style="margin-right: 8px;" name="information-circle-outline"></ion-icon>  <ion-text>${message}</ion-text></div>`
        );
    }
  }

  async presentToast({ type = 'info', message, duration = 7000 }) {
    const toast = await this.toastController.create({
      message: this.formatMessage(message, type),
      duration,
      position: 'middle',
    });
    toast.present();
  }

  async presentToastWithClose({ type = 'info', message, duration = 10000 }) {
    const toast = await this.toastController.create({
      cssClass: 'toast-styles',
      message: this.formatMessage(message, type),
      duration,
      buttons: [
        {
          icon: 'close',
          role: 'cancel',
        },
      ],
      position: 'middle',
    });
    toast.present();
  }
}
