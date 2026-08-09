import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private static readonly STORAGE_KEY = 'favoritos';
  private favoritesSubject = new BehaviorSubject<any[]>(this.load());

  constructor() {}

  private load(): any[] {
    try {
      return JSON.parse(localStorage.getItem(FavoritesService.STORAGE_KEY) || '[]');
    } catch {
      localStorage.removeItem(FavoritesService.STORAGE_KEY);
      return [];
    }
  }

  private save(items: any[]) {
    localStorage.setItem(FavoritesService.STORAGE_KEY, JSON.stringify(items));
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
    const id = this.getId(producto);
    if (!id) return false;
    return this.items.some(p => this.getId(p) === id);
  }

  /** Agrega o quita. Devuelve true si quedó como favorito. */
  toggle(producto: any): boolean {
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
    this.save(this.items.filter(p => this.getId(p) !== Number(idproducto)));
  }

  clear() {
    localStorage.removeItem(FavoritesService.STORAGE_KEY);
    this.favoritesSubject.next([]);
  }
}
