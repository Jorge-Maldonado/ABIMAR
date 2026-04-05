import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {

  carrito: any[] = [];

  descuento: number = 0;
  envio: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.items$.subscribe(data => {
      this.carrito = data;
    });
  }

  // ✅ MANTENIDOS para el HTML
  incrementarCantidad(item: any) {
    this.cartService.incrementar(item.id);
  }

  decrementarCantidad(item: any) {
    this.cartService.decrementar(item.id);
  }

  eliminarProducto(item: any) {
    this.cartService.eliminar(item.id);
  }

  get subtotal() {
    return this.cartService.total;
  }

  get total() {
    return this.subtotal - this.descuento + this.envio;
  }

  confirmarCompra() {
    alert('Compra realizada correctamente ✅');
    this.cartService.limpiar();
  }
}