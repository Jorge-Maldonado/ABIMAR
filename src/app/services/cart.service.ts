import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartSubject = new BehaviorSubject<any[]>(this.loadCart());

  constructor() {}

  // ===============================
  // 📦 STORAGE
  // ===============================
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

  // ===============================
  // 🆔 NORMALIZADOR (CLAVE PRO)
  // ===============================
  private getId(producto: any): number {
    return producto.idproducto || producto.id;
  }

  // ===============================
  // ➕ ADD
  // ===============================
  add(producto: any, cantidad: number = 1) {
    const cart = [...this.items];
    const id = this.getId(producto);
    const qty = Math.max(1, Number(cantidad) || 1);

    const index = cart.findIndex(p =>
      this.getId(p) === id &&
      JSON.stringify(p.options || {}) === JSON.stringify(producto.options || {})
    );

    if (index > -1) {
      cart[index].cantidad += qty;
    } else {
      cart.push({
        ...producto,
        idproducto: id,
        cantidad: qty,
        options: producto.options || {}
      });
    }

    this.saveCart(cart);
  }

  // ===============================
  // 🔼 INCREMENTAR
  // ===============================
  incrementar(idproducto: number) {
    const cart = this.items.map(p =>
      this.getId(p) === idproducto
        ? { ...p, cantidad: p.cantidad + 1 }
        : p
    );

    this.saveCart(cart);
  }

  // ===============================
  // 🔽 DECREMENTAR
  // ===============================
  decrementar(idproducto: number) {
    let cart = this.items.map(p =>
      this.getId(p) === idproducto
        ? { ...p, cantidad: p.cantidad - 1 }
        : p
    );

    cart = cart.filter(p => p.cantidad > 0);

    this.saveCart(cart);
  }

  // ===============================
  // ❌ ELIMINAR
  // ===============================
  eliminar(idproducto: number) {
    const cart = this.items.filter(p => this.getId(p) !== idproducto);
    this.saveCart(cart);
  }

  // ===============================
  // 🧹 LIMPIAR
  // ===============================
  limpiar() {
    localStorage.removeItem('carrito');
    this.cartSubject.next([]);
  }

  // ===============================
  // 💰 TOTAL
  // ===============================
  get total() {
    return this.items.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  }

  get totalItems() {
    return this.items.reduce((sum, p) => sum + p.cantidad, 0);
  }
}