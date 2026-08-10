import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { ToastController, AlertController, MenuController } from '@ionic/angular';
import { UtilService } from '../util.service';
import { CartService } from '../services/cart.service';
import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  usuarioEmail: string = '';
  categorias: any[] = [];
  productos: any[] = [];
  destacados: any[] = [];
  masVendidos: any[] = [];
  favoritos: any[] = [];

  showAllCategorias = false;
  showAllDestacados = false;
  showAllMasVendidos = false;
  showAllFavoritos = false;
  showAllProductos = false;
  showIcons: boolean = true;
  searchTerm: string = '';
  cartCount = 0;

  constructor(
    private apiService: ApiService<any>,
    private router: Router,
    private toastController: ToastController,
    private alertCtrl: AlertController,
    private util: UtilService,
    private menu: MenuController,
    private cartService: CartService,
    private favoritesService: FavoritesService
  ) { }

  ngOnInit() {
    this.util.getShowIcons().subscribe(s => {
      this.showIcons = s;
    });

    this.cartService.items$.subscribe(() => {
      this.cartCount = this.cartService.totalItems;
    });

    this.favoritesService.items$.subscribe(items => {
      this.favoritos = items || [];
    });
  }

  get displayName(): string {
    const email = (this.usuarioEmail || '').trim();
    if (!email || email === 'Invitado') return 'Invitado';
    const local = email.split('@')[0] || email;
    return local.charAt(0).toUpperCase() + local.slice(1);
  }

  get isGuestUser(): boolean {
    return this.usuarioEmail === 'Invitado' || localStorage.getItem('guestAccess') === 'true';
  }

  scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openMenu() {
    this.menu.enable(true, 'mainMenu').then(() => this.menu.open('mainMenu'));
  }

  ionViewWillEnter() {
    this.usuarioEmail = localStorage.getItem('usuario') || 'Invitado';
    this.util.setMenuState(true);
    this.menu.enable(true, 'mainMenu');
    this.favoritesService.syncFromSession();
    // Ionic reutiliza la página: recargar catálogo al entrar (login, guest, back)
    this.loadCategorias();
    this.loadProductos();
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Deseas salir de tu cuenta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          handler: () => {
            localStorage.removeItem('usuario');
            localStorage.removeItem('personal');
            localStorage.removeItem('guestAccess');
            this.favoritesService.clearSession();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

  loadCategorias() {
    this.apiService
      .post(this.apiService.url('categoria/list'), {})
      .subscribe(
        (res: any) => {
          if (Array.isArray(res)) {
            this.categorias = res.map((c, index) => ({
              ...c,
              imagen: c.imagen && c.imagen.trim() !== ''
                ? c.imagen
                : `assets/categories/category-${index + 1}.png`,
            }));
          } else {
            this.categorias = [];
          }
        },
        (err) => console.error('Error cargando categorías:', err)
      );
  }

  loadProductos() {
    this.apiService
      .post(this.apiService.url('producto/list'), {})
      .subscribe(
        (res: any) => {
          if (Array.isArray(res)) {
            this.productos = res
              .filter(p => Number(p.status) === 1)
              .map((p) => ({
                ...p,
                destacado: this.readFlag(p, 'destacado'),
                masVendido: this.readFlag(p, 'masVendido', 'masvendido', 'mas_vendido'),
                imagen: this.normalizeImagePath(p.imagen),
              }));
            this.destacados = this.productos.filter(p => p.destacado);
            this.masVendidos = this.productos.filter(p => p.masVendido);
          } else {
            this.productos = [];
            this.destacados = [];
            this.masVendidos = [];
          }
        },
        (err) => console.error('Error cargando productos:', err)
      );
  }

  toggleVerTodos(tipo: string) {
    if (tipo === 'categorias') this.showAllCategorias = !this.showAllCategorias;
    if (tipo === 'destacados') this.showAllDestacados = !this.showAllDestacados;
    if (tipo === 'masVendidos') this.showAllMasVendidos = !this.showAllMasVendidos;
    if (tipo === 'favoritos') this.showAllFavoritos = !this.showAllFavoritos;
    if (tipo === 'productos') this.showAllProductos = !this.showAllProductos;
  }

  esFavorito(producto: any): boolean {
    return this.favoritesService.isFavorite(producto);
  }

  async agregarFavorito(producto: any) {
    if (this.isGuestUser) {
      await this.mostrarToast('Inicia sesión para usar favoritos', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    const activo = this.favoritesService.toggle(producto);
    if (activo) {
      await this.mostrarToast(`"${producto.nombre}" agregado a favoritos`, 'warning');
    } else {
      await this.mostrarToast(`"${producto.nombre}" quitado de favoritos`, 'medium');
    }
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

  /** Normaliza boolean / 0|1 / "true" del backend. */
  private isFlagOn(val: any): boolean {
    if (val === true || val === 1 || val === '1') return true;
    if (typeof val === 'string' && val.trim().toLowerCase() === 'true') return true;
    return false;
  }

  /** Lee un flag desde posibles alias JSON (camelCase / lowercase / snake). */
  private readFlag(obj: any, ...keys: string[]): boolean {
    if (!obj) return false;
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return this.isFlagOn(obj[key]);
      }
    }
    const lowerKeys = keys.map(k => k.toLowerCase());
    for (const k of Object.keys(obj)) {
      if (lowerKeys.includes(k.toLowerCase())) {
        return this.isFlagOn(obj[k]);
      }
    }
    return false;
  }

  get productosFiltrados() {
    if (!this.searchTerm || this.searchTerm.length < 2) return [];
    const term = this.searchTerm.toLowerCase();
    return this.productos.filter(
      p =>
        (p.nombre || '').toLowerCase().includes(term) ||
        (p.descripcion || '').toLowerCase().includes(term)
    );
  }

  verDetalle(producto: any) {
    this.router.navigate(['/item-details'], {
      queryParams: { producto: JSON.stringify(producto) },
    });
  }

  // ===============================
  // 🛒 CORRECTO (REACTIVO)
  // ===============================
  async agregarCarrito(producto: any) {
    if (this.isGuestUser) {
      await this.mostrarToast('Inicia sesión para comprar', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.add(producto);
    await this.mostrarToast(`"${producto.nombre}" agregado al carrito`, 'warning');
  }

  comprarProducto(producto: any) {
    // Invitado y usuario: ver detalle; la compra se exige al agregar al carrito
    this.verDetalle(producto);
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  abrirCategoria(categoria: any) {
    this.router.navigate(['/categoria-productos'], {
      queryParams: { id: categoria.idcategoria, nombre: categoria.nombre }
    });
  }
}