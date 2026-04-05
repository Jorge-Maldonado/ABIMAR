import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.page.html',
  styleUrls: ['./my-cart.page.scss'],
})
export class MyCartPage implements OnInit {

  carrito: any[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.items$.subscribe(data => {
      this.carrito = data;
    });
  }

  incrementarCantidad(item: any) {
    this.cartService.incrementar(item.id);
  }

  decrementarCantidad(item: any) {
    this.cartService.decrementar(item.id);
  }

  eliminarProducto(item: any) {
    this.cartService.eliminar(item.id);
  }

  get total() {
    return this.cartService.total;
  }
}