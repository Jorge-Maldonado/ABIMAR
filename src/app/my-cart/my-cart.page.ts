import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.page.html',
  styleUrls: ['./my-cart.page.scss'],
})
export class MyCartPage {

  carrito: any[] = [];

  constructor(
    private cartService: CartService,
    private menu: MenuController,
    private util: UtilService
  ) {}

  // 🔥 Ionic lifecycle (clave)
  ionViewWillEnter() {
    this.util.setMenuState(true);
    this.menu.enable(true, 'mainMenu');
    this.cartService.syncFromSession();
    this.cartService.items$.subscribe(data => {
      this.carrito = data;
    });
  }

  incrementarCantidad(item: any) {
    this.cartService.incrementar(item.idproducto);
  }

  decrementarCantidad(item: any) {
    this.cartService.decrementar(item.idproducto);
  }

  eliminarProducto(item: any) {
    this.cartService.eliminar(item.idproducto);
  }

  get total() {
    return this.cartService.total;
  }

  get totalItems() {
    return this.cartService.totalItems;
  }
}