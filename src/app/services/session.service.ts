import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController } from '@ionic/angular';
import { FavoritesService } from './favorites.service';
import { CartService } from './cart.service';
import { UtilService } from '../util.service';

/**
 * Sesión del cliente (tienda). No toca adminUsuario/adminPersonal.
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private menu: MenuController,
    private util: UtilService,
    private favorites: FavoritesService,
    private cart: CartService
  ) {}

  /** Hay usuario de tienda logueado (no invitado). */
  isLoggedIn(): boolean {
    const usuario = (localStorage.getItem('usuario') || '').trim();
    const guest = localStorage.getItem('guestAccess') === 'true';
    return !!usuario && !guest;
  }

  /** Cierra sesión del cliente con confirmación. */
  async logoutCliente(): Promise<void> {
    if (!this.isLoggedIn()) {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Deseas salir de tu cuenta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          handler: () => {
            this.clearClienteSession();
            this.router.navigateByUrl('/login', { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }

  clearClienteSession(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('personal');
    localStorage.removeItem('guestAccess');
    this.util.setGuest(false);
    this.util.setMenuState(false);
    this.util.setShowIcons(false);
    this.favorites.clearSession();
    this.cart.clearSession();
    this.menu.close('mainMenu');
    this.menu.enable(false, 'mainMenu');
  }
}
