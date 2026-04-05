import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartSubject = new BehaviorSubject<any[]>(this.loadCart());

  constructor() {}

  private loadCart(): any[] {
    try {
      return JSON.parse(localStorage.getItem('carrito') || '[]');
    } catch {
      localStorage.removeItem('carrito');
      return [];
    }
  }

  private saveCart(cart: any[]) {
    localStorage.setItem('carrito', JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  get items$() {
    return this.cartSubject.asObservable();
  }

  get items() {
    return this.cartSubject.value;
  }

  add(producto: any) {
    const cart = [...this.items];
    const index = cart.findIndex(p => p.id === producto.id);

    if (index > -1) {
      cart[index].cantidad += 1;
    } else {
      cart.push({ ...producto, cantidad: 1 });
    }

    this.saveCart(cart);
  }

  incrementar(id: number) {
    const cart = this.items.map(p =>
      p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p
    );
    this.saveCart(cart);
  }

  decrementar(id: number) {
    let cart = this.items.map(p =>
      p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p
    );

    cart = cart.filter(p => p.cantidad > 0);
    this.saveCart(cart);
  }

  eliminar(id: number) {
    const cart = this.items.filter(p => p.id !== id);
    this.saveCart(cart);
  }

  limpiar() {
    localStorage.removeItem('carrito');
    this.cartSubject.next([]);
  }

  get total() {
    return this.items.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  }

  get totalItems() {
    return this.items.reduce((sum, p) => sum + p.cantidad, 0);
  }
}