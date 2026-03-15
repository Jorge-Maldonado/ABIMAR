import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.page.html',
  styleUrls: ['./my-cart.page.scss'],
})
export class MyCartPage implements OnInit {

  carrito: any[] = [];

  constructor() { }

  ngOnInit() {
    this.cargarCarrito();
  }

  cargarCarrito() {
    const data = localStorage.getItem('carrito');
    this.carrito = data ? JSON.parse(data) : [];
  }

  incrementarCantidad(item: any) {
    item.cantidad += 1;
    this.actualizarLocalStorage();
  }

  decrementarCantidad(item: any) {
    if (item.cantidad > 1) {
      item.cantidad -= 1;
      this.actualizarLocalStorage();
    }
  }

  eliminarProducto(item: any) {
    this.carrito = this.carrito.filter(p => p.idproducto !== item.idproducto);
    this.actualizarLocalStorage();
  }

  actualizarLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  get total() {
    return this.carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  }
}
