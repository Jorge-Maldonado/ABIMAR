import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Carrito por `personal` (id persona). Cada cliente tiene su propia lista
 * en localStorage: `carrito:{personalId}`.
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {

  private static readonly LEGACY_KEY = 'carrito';
  private static readonly KEY_PREFIX = 'carrito:';

  private ownerPersonal: number | null = null;
  private cartSubject = new BehaviorSubject<any[]>([]);

  constructor() {
    this.syncFromSession();
  }

  get ownerPersonalId(): number | null {
    return this.ownerPersonal;
  }

  /**
   * Carga el carrito del `personal` en sesión.
   * Invitado / sin personal → carrito vacío en memoria (no borra otros usuarios).
   */
  syncFromSession(): void {
    localStorage.removeItem(CartService.LEGACY_KEY);

    const guest = localStorage.getItem('guestAccess') === 'true';
    const personalId = Number(localStorage.getItem('personal') || 0);

    if (guest || !personalId) {
      this.ownerPersonal = null;
      this.cartSubject.next([]);
      return;
    }

    this.ownerPersonal = personalId;
    this.cartSubject.next(this.loadFor(personalId));
  }

  /** Fija el dueño (tras login) y recarga su carrito. */
  setOwner(personalId: number | string | null): void {
    const id = Number(personalId) || 0;
    localStorage.removeItem(CartService.LEGACY_KEY);

    if (!id) {
      this.ownerPersonal = null;
      this.cartSubject.next([]);
      return;
    }

    this.ownerPersonal = id;
    this.cartSubject.next(this.loadFor(id));
  }

  /** Sale de sesión: vacía memoria, no borra el carrito guardado del usuario. */
  clearSession(): void {
    this.ownerPersonal = null;
    this.cartSubject.next([]);
  }

  private storageKey(personalId: number): string {
    return `${CartService.KEY_PREFIX}${personalId}`;
  }

  private loadFor(personalId: number): any[] {
    try {
      const raw = localStorage.getItem(this.storageKey(personalId));
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem(this.storageKey(personalId));
      return [];
    }
  }

  private saveCart(cart: any[]) {
    if (!this.ownerPersonal) {
      this.cartSubject.next([]);
      return;
    }
    localStorage.setItem(this.storageKey(this.ownerPersonal), JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  get items$() {
    return this.cartSubject.asObservable();
  }

  get items() {
    return this.cartSubject.value;
  }

  private getId(producto: any): number {
    return Number(producto?.idproducto ?? producto?.id) || 0;
  }

  add(producto: any, cantidad: number = 1) {
    if (!this.ownerPersonal) {
      return;
    }

    const cart = [...this.items];
    const id = this.getId(producto);
    if (!id) {
      return;
    }

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

  incrementar(idproducto: number) {
    if (!this.ownerPersonal) {
      return;
    }

    const cart = this.items.map(p =>
      this.getId(p) === Number(idproducto)
        ? { ...p, cantidad: p.cantidad + 1 }
        : p
    );
    this.saveCart(cart);
  }

  decrementar(idproducto: number) {
    if (!this.ownerPersonal) {
      return;
    }

    let cart = this.items.map(p =>
      this.getId(p) === Number(idproducto)
        ? { ...p, cantidad: p.cantidad - 1 }
        : p
    );
    cart = cart.filter(p => p.cantidad > 0);
    this.saveCart(cart);
  }

  eliminar(idproducto: number) {
    if (!this.ownerPersonal) {
      return;
    }

    const cart = this.items.filter(p => this.getId(p) !== Number(idproducto));
    this.saveCart(cart);
  }

  /** Vacía el carrito del usuario actual (p. ej. tras pago). */
  limpiar() {
    if (this.ownerPersonal) {
      localStorage.removeItem(this.storageKey(this.ownerPersonal));
    }
    localStorage.removeItem(CartService.LEGACY_KEY);
    this.cartSubject.next([]);
  }

  get total() {
    return this.items.reduce((sum, p) => sum + (Number(p.precio) || 0) * (Number(p.cantidad) || 0), 0);
  }

  get totalItems() {
    return this.items.reduce((sum, p) => sum + (Number(p.cantidad) || 0), 0);
  }
}
