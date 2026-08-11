import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { FavoritesService } from '../services/favorites.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.page.html',
  styleUrls: ['./item-details.page.scss'],
})
export class ItemDetailsPage implements OnInit {

  producto: any = null;
  cantidad = 1;
  cartCount = 0;
  adding = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    public session: SessionService
  ) {}

  ngOnInit() {
    this.cartService.items$.subscribe(() => {
      this.cartCount = this.cartService.totalItems;
    });

    this.route.queryParams.subscribe((params) => {
      this.cantidad = 1;
      if (params && params['producto']) {
        try {
          const raw = JSON.parse(params['producto']);
          this.producto = {
            ...raw,
            imagen: this.normalizeImagePath(raw?.imagen),
          };
        } catch {
          this.producto = null;
        }
      } else {
        this.producto = null;
      }
    });
  }

  get isGuestUser(): boolean {
    return localStorage.getItem('guestAccess') === 'true' || !localStorage.getItem('usuario');
  }

  async logout() {
    await this.session.logoutCliente();
  }

  get esFavorito(): boolean {
    return !!this.producto && this.favoritesService.isFavorite(this.producto);
  }

  get stockDisponible(): number {
    return Math.max(0, Number(this.producto?.stock) || 0);
  }

  get hayStock(): boolean {
    return this.stockDisponible > 0;
  }

  get stockLabel(): string {
    if (!this.hayStock) return 'Agotado';
    if (this.stockDisponible <= 5) return `Quedan ${this.stockDisponible}`;
    return `${this.stockDisponible} en stock`;
  }

  get stockClass(): string {
    if (!this.hayStock) return 'stock-badge--out';
    if (this.stockDisponible <= 5) return 'stock-badge--low';
    return 'stock-badge--ok';
  }

  incrementar() {
    if (this.cantidad < this.stockDisponible) {
      this.cantidad += 1;
    }
  }

  decrementar() {
    if (this.cantidad > 1) {
      this.cantidad -= 1;
    }
  }

  async toggleFavorito() {
    if (!this.producto) return;

    if (this.isGuestUser) {
      await this.mostrarToast('Inicia sesión para usar favoritos', 'warning');
      return;
    }

    const activo = this.favoritesService.toggle(this.producto);
    if (activo) {
      await this.mostrarToast(`"${this.producto.nombre}" agregado a favoritos`, 'warning');
    } else {
      await this.mostrarToast(`"${this.producto.nombre}" quitado de favoritos`, 'medium');
    }
  }

  async agregarAlCarrito(): Promise<boolean> {
    if (!this.producto || this.adding) {
      return false;
    }

    if (this.isGuestUser) {
      await this.mostrarToast('Inicia sesión para comprar', 'warning');
      this.router.navigate(['/login']);
      return false;
    }

    if (!this.hayStock) {
      await this.mostrarToast('Producto sin stock', 'danger');
      return false;
    }

    const productId = this.producto.idproducto || this.producto.id;
    if (!productId) {
      await this.mostrarToast('Producto inválido', 'danger');
      return false;
    }

    const qty = Math.min(this.cantidad, this.stockDisponible);
    this.adding = true;

    this.cartService.add({
      ...this.producto,
      idproducto: productId,
    }, qty);

    this.adding = false;
    await this.mostrarToast(`"${this.producto.nombre}" ×${qty} al carrito`, 'warning');
    return true;
  }

  async comprarAhora() {
    const ok = await this.agregarAlCarrito();
    if (!ok) return;
    this.router.navigate(['/my-cart']);
  }

  irAHome() {
    this.router.navigate(['/home']);
  }

  irACarrito() {
    this.router.navigate(['/my-cart']);
  }

  private normalizeImagePath(val: any): string {
    if (!val) return 'assets/no-image.png';
    const s = String(val).trim();
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith('assets/')) return s;
    if (s.startsWith('/assets/')) return s.substring(1);
    const onlyName = s.replace(/^.*[\\/]/, '');
    return `assets/products/${onlyName}`;
  }

  private async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}
