import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {

  carrito: any[] = [];
  descuento: number = 0; // Por ahora 0
  subtotal: number = 0;

  constructor() { }

  ngOnInit() {
    this.cargarCarrito();
  }

  // Carga el carrito desde localStorage
  cargarCarrito() {
    const data = localStorage.getItem('carrito');
    this.carrito = data ? JSON.parse(data) : [];
    this.calcularSubtotal();
  }

  // Incrementa cantidad del producto
  incrementarCantidad(item: any) {
    item.cantidad += 1;
    this.actualizarLocalStorage();
  }

  // Decrementa cantidad del producto
  decrementarCantidad(item: any) {
    if (item.cantidad > 1) {
      item.cantidad -= 1;
      this.actualizarLocalStorage();
    }
  }

  // Elimina un producto del carrito
  eliminarProducto(item: any) {
    this.carrito = this.carrito.filter(p => p.idproducto !== item.idproducto);
    this.actualizarLocalStorage();
  }

  // Actualiza localStorage con la nueva data y recalcula subtotal
  actualizarLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
    this.calcularSubtotal();
  }

  // Calcula subtotal sumando precio * cantidad
  calcularSubtotal() {
    this.subtotal = this.carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  }

  // Calcula el envío como 10% del subtotal
  get envio() {
    return this.subtotal * 0.10;
  }

  // Total final considerando subtotal, descuento y envío
  get total() {
    return this.subtotal - this.descuento + this.envio;
  }

}
