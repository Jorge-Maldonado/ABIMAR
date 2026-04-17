import { Component } from '@angular/core';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.page.html',
  styleUrls: ['./my-cart.page.scss'],
})
export class MyCartPage {

  carrito: any[] = [];

  constructor(private cartService: CartService) {}

  // 🔥 Ionic lifecycle (clave)
  ionViewWillEnter() {
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
}