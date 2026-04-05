import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loading: HTMLIonLoadingElement | null = null;
  private isLoading = false;

  constructor(private loadingCtrl: LoadingController) {}

  async show(message: string = 'Cargando...') {
    if (this.isLoading) return;

    this.isLoading = true;

    this.loading = await this.loadingCtrl.create({
      message,
      spinner: 'crescent',
      backdropDismiss: false,
      cssClass: 'custom-loader'
    });

    await this.loading.present();
  }

  async hide() {
    if (!this.isLoading) return;

    this.isLoading = false;

    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }
}