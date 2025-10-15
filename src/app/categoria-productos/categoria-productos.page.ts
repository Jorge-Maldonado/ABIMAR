import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-categoria-productos',
  templateUrl: './categoria-productos.page.html',
  styleUrls: ['./categoria-productos.page.scss'],
})
export class CategoriaProductosPage implements OnInit {
  categoriaId: number = 0;
  categoriaNombre: string = '';
  productos: any[] = [];
  searchTerm: string = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService<any>,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.categoriaId = +params['id'] || 0;
      this.categoriaNombre = params['nombre'] || '';
      this.loadProductos();
    });
  }

  loadProductos() {
    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/producto/list', {})
      .subscribe(
        (res: any) => {
          if (Array.isArray(res)) {
            // 🔹 Filtrar solo los productos de la categoría seleccionada
            this.productos = res
              .filter(p => p.categoriaId === this.categoriaId && p.status === 1)
              .map(p => ({
                ...p,
                imagen: this.normalizeImagePath(p.imagen),
              }));
          } else {
            this.productos = [];
          }
        },
        err => console.error('Error cargando productos:', err)
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

  get productosFiltrados() {
    if (!this.searchTerm) return this.productos;
    const term = this.searchTerm.toLowerCase();
    return this.productos.filter(
      p =>
        (p.nombre || '').toLowerCase().includes(term) ||
        (p.descripcion || '').toLowerCase().includes(term)
    );
  }

  agregarCarrito(producto: any) {
    console.log('Producto agregado al carrito:', producto);
    this.mostrarToast(`"${producto.nombre}" agregado al carrito 🛒`);
  }

  agregarFavorito(producto: any) {
    console.log('Producto agregado a favoritos:', producto);
    this.mostrarToast(`"${producto.nombre}" agregado a favoritos ❤️`);
  }

  comprarProducto(producto: any) {
    console.log('Compra iniciada para:', producto);
    this.mostrarToast(`Iniciando compra de "${producto.nombre}" 💳`);
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: 'warning',
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
  
}
