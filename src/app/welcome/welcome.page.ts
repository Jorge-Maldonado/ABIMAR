import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilService } from '../util.service';
import { FavoritesService } from '../services/favorites.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(
    private menu: MenuController,
    private router: Router,
    private util: UtilService,
    private favorites: FavoritesService,
    private cart: CartService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.util.setMenuState(false);
    this.util.setShowIcons(false);
    await this.menu.enable(false, 'mainMenu');
    await this.menu.close('mainMenu');
  }

  async continueAsGuest(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    localStorage.setItem('guestAccess', 'true');
    this.util.setGuest(true);
    this.util.setShowIcons(false);
    this.util.setMenuState(true);
    this.favorites.clearSession();
    this.cart.clearSession();
    await this.menu.enable(true, 'mainMenu');
    await this.menu.close('mainMenu');

    await this.router.navigateByUrl('/home', { replaceUrl: true });
  }
}
