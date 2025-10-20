import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { UtilService } from '../util.service';

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

  showAllCategorias = false;
  showAllDestacados = false;
  showAllMasVendidos = false;
  showIcons: boolean = true;
  searchTerm: string = '';

  constructor(
    private apiService: ApiService<any>,
    private router: Router,
    private toastController: ToastController,
    private alertCtrl: AlertController,
    private util: UtilService
  ) { }

  ngOnInit() {
    //const isGuest = localStorage.getItem('guestAccess') === 'true';
    this.usuarioEmail = localStorage.getItem('usuario') || 'Invitado';

    // Suscribirse al estado de iconos
    this.util.getShowIcons().subscribe(s => {
      this.showIcons = s;
    });
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
            localStorage.removeItem('guestAccess');
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

  loadCategorias() {
    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/categoria/list', {})
      .subscribe(
        (res: any) => {
          if (Array.isArray(res)) {
            this.categorias = res.map((c, index) => ({
              ...c,
              imagen: c.imagen && c.imagen.trim() !== '' ? c.imagen : `assets/categories/category-${index + 1}.png`,
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
      .post('https://backend-abimar.onrender.com/abimar/core/api/producto/list', {})
      .subscribe(
        (res: any) => {
          if (Array.isArray(res)) {
            this.productos = res.map((p) => ({
              ...p,
              imagen: this.normalizeImagePath(p.imagen),
            }));
            this.destacados = this.productos.slice(0, 5);
            this.masVendidos = this.productos.slice(5, 10);
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

  get productosFiltrados() {
    if (!this.searchTerm) return this.productos;
    const term = this.searchTerm.toLowerCase();
    return this.productos.filter(
      (p) =>
        (p.nombre || '').toLowerCase().includes(term) ||
        (p.descripcion || '').toLowerCase().includes(term)
    );
  }

  verDetalle(producto: any) {
    this.router.navigate(['/item-details'], {
      queryParams: { producto: JSON.stringify(producto) },
    });
  }

  async agregarCarrito(producto: any) {
    await this.mostrarToast(`"${producto.nombre}" agregado al carrito 🛒`, 'warning');
  }

  async agregarFavorito(producto: any) {
    await this.mostrarToast(`"${producto.nombre}" agregado a favoritos ❤️`, 'warning');
  }

  comprarProducto(producto: any) {
    this.mostrarToast(`Iniciando compra de "${producto.nombre}" 💳`, 'success');
    this.verDetalle(producto);
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
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
