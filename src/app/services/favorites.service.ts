import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private static readonly LEGACY_KEY = 'favoritos';
  private static readonly KEY_PREFIX = 'favoritos:';

  private ownerKey: string | null = null;
  private favoritesSubject = new BehaviorSubject<any[]>([]);

  constructor() {
    this.syncFromSession();
  }

  /** Email normalizado del dueño actual, o null si invitado/sin sesión. */
  get owner(): string | null {
    return this.ownerKey;
  }

  /**
   * Carga favoritos del usuario en sesión (`localStorage.usuario`).
   * Cada usuario tiene su propia lista; el invitado no ve favoritos de nadie.
   */
  syncFromSession(): void {
    // Limpiar lista global antigua (no pertenece a un usuario)
    localStorage.removeItem(FavoritesService.LEGACY_KEY);

    const email = (localStorage.getItem('usuario') || '').trim().toLowerCase();
    const guest = localStorage.getItem('guestAccess') === 'true';

    if (!email || guest) {
      this.ownerKey = null;
      this.favoritesSubject.next([]);
      return;
    }

    this.ownerKey = email;
    this.favoritesSubject.next(this.loadFor(email));
  }

  /** Fija el dueño (p. ej. tras login) y recarga su lista. */
  setOwner(email: string | null): void {
    const normalized = (email || '').trim().toLowerCase();
    if (!normalized) {
      this.ownerKey = null;
      this.favoritesSubject.next([]);
      return;
    }

    this.ownerKey = normalized;
    // Descartar clave global antigua (compartida entre usuarios)
    localStorage.removeItem(FavoritesService.LEGACY_KEY);
    this.favoritesSubject.next(this.loadFor(normalized));
  }

  clearSession(): void {
    this.ownerKey = null;
    this.favoritesSubject.next([]);
  }

  private storageKey(email: string): string {
    return `${FavoritesService.KEY_PREFIX}${email}`;
  }

  private loadFor(email: string): any[] {
    try {
      const raw = localStorage.getItem(this.storageKey(email));
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem(this.storageKey(email));
      return [];
    }
  }

  private save(items: any[]) {
    if (!this.ownerKey) {
      this.favoritesSubject.next([]);
      return;
    }
    localStorage.setItem(this.storageKey(this.ownerKey), JSON.stringify(items));
    this.favoritesSubject.next(items);
  }

  get items$() {
    return this.favoritesSubject.asObservable();
  }

  get items() {
    return this.favoritesSubject.value;
  }

  get count() {
    return this.items.length;
  }

  private getId(producto: any): number {
    return Number(producto?.idproducto ?? producto?.id) || 0;
  }

  isFavorite(producto: any): boolean {
    if (!this.ownerKey) return false;
    const id = this.getId(producto);
    if (!id) return false;
    return this.items.some(p => this.getId(p) === id);
  }

  /** Agrega o quita. Devuelve true si quedó como favorito. */
  toggle(producto: any): boolean {
    if (!this.ownerKey) return false;

    const id = this.getId(producto);
    if (!id) return false;

    if (this.isFavorite(producto)) {
      this.remove(id);
      return false;
    }

    this.add(producto);
    return true;
  }

  add(producto: any) {
    if (!this.ownerKey) return;

    const id = this.getId(producto);
    if (!id || this.isFavorite(producto)) return;

    this.save([
      ...this.items,
      {
        ...producto,
        idproducto: id
      }
    ]);
  }

  remove(idproducto: number) {
    if (!this.ownerKey) return;
    this.save(this.items.filter(p => this.getId(p) !== Number(idproducto)));
  }

  /** Borra solo la lista del usuario actual (no otras cuentas). */
  clear() {
    if (!this.ownerKey) {
      this.favoritesSubject.next([]);
      return;
    }
    localStorage.removeItem(this.storageKey(this.ownerKey));
    this.favoritesSubject.next([]);
  }
}
