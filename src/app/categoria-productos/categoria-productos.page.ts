import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController, ToastController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { FavoritesService } from '../services/favorites.service';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-categoria-productos',
  templateUrl: './categoria-productos.page.html',
  styleUrls: ['./categoria-productos.page.scss'],
})
export class CategoriaProductosPage implements OnInit {
  categoriaId = 0;
  categoriaNombre = '';
  productos: any[] = [];
  searchTerm = '';
  loading = false;
  cartCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService<any>,
    private toastController: ToastController,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private util: UtilService,
    private menu: MenuController
  ) {}

  ngOnInit() {
    this.cartService.items$.subscribe(() => {
      this.cartCount = this.cartService.totalItems;
    });

    this.route.queryParams.subscribe(params => {
      this.categoriaId = Number(params['id']) || 0;
      this.categoriaNombre = params['nombre'] || 'Categoría';
      this.searchTerm = '';
      this.loadProductos();
    });
  }

  ionViewWillEnter() {
    this.util.setMenuState(true);
    this.menu.enable(true, 'mainMenu');
  }

  get isGuestUser(): boolean {
    return localStorage.getItem('guestAccess') === 'true' || !localStorage.getItem('usuario');
  }

  get productosFiltrados() {
    if (!this.searchTerm) {
      return this.productos;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.productos.filter(
      p =>
        (p.nombre || '').toLowerCase().includes(term) ||
        (p.descripcion || '').toLowerCase().includes(term)
    );
  }

  loadProductos(event?: any) {
    if (!event) {
      this.loading = true;
    }

    if (!this.categoriaId) {
      this.productos = [];
      this.loading = false;
      if (event) {
        event.target.complete();
      }
      return;
    }

    this.apiService
      .post(this.apiService.url('producto/list'), {})
      .subscribe(
        (res: any) => {
          const lista = Array.isArray(res) ? res : [];
          this.productos = lista
            .filter(p =>
              Number(p.categoriaId) === Number(this.categoriaId) &&
              Number(p.status) === 1
            )
            .map(p => ({
              ...p,
              imagen: this.normalizeImagePath(p.imagen),
            }));
          this.loading = false;
          if (event) {
            event.target.complete();
          }
        },
        async (err) => {
          console.error('Error cargando productos:', err);
          this.productos = [];
          this.loading = false;
          if (event) {
            event.target.complete();
          }
          await this.mostrarToast('No se pudieron cargar los productos', 'danger');
        }
      );
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

  verDetalle(producto: any) {
    this.router.navigate(['/item-details'], {
      queryParams: { producto: JSON.stringify(producto) },
    });
  }

  async agregarCarrito(producto: any) {
    if (this.isGuestUser) {
      await this.mostrarToast('Inicia sesión para usar el carrito', 'warning');
      return;
    }
    this.cartService.add(producto);
    await this.mostrarToast(`"${producto.nombre}" agregado al carrito`, 'warning');
  }

  esFavorito(producto: any): boolean {
    return this.favoritesService.isFavorite(producto);
  }

  async agregarFavorito(producto: any) {
    if (this.isGuestUser) {
      await this.mostrarToast('Inicia sesión para usar favoritos', 'warning');
      return;
    }
    const activo = this.favoritesService.toggle(producto);
    if (activo) {
      await this.mostrarToast(`"${producto.nombre}" agregado a favoritos`, 'warning');
    } else {
      await this.mostrarToast(`"${producto.nombre}" quitado de favoritos`, 'medium');
    }
  }

  comprarProducto(producto: any) {
    this.verDetalle(producto);
  }

  irAHome() {
    this.router.navigate(['/home']);
  }

  private async mostrarToast(mensaje: string, color: string = 'warning') {
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
