import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ModalController } from '@ionic/angular';
import { ImageSelectorComponent } from '../components/image-selector/image-selector.component';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {
  nombre: string = '';
  descripcion: string = '';
  precio: number = 0;
  stock: number = 0;
  imagen: string = ''; // solo name.ext

  productos: any[] = [];

  editId: number | null = null;
  originalData: any = {};

  searchTerm = '';

  constructor(
    private apiService: ApiService<any>,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadProductos();
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

  async abrirSelectorImagen() {
    const modal = await this.modalCtrl.create({
      component: ImageSelectorComponent,
      showBackdrop: true,
      backdropDismiss: true,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'ok' && data) {
      this.imagen = String(data);
    }
  }

  loadProductos() {
    this.apiService
      .post(
        'https://backend-abimar.onrender.com/abimar/core/api/producto/list',
        {}
      )
      .subscribe(
        (res: any) => {
          if (Array.isArray(res)) {
            this.productos = res.map((p) => ({
              ...p,
              imagen: this.normalizeImagePath(p.imagen),
            }));
          } else {
            this.productos = [];
          }
        },
        (err) => console.error('Error cargando productos:', err)
      );
  }

  createProducto() {
    const producto = {
      categoriaId: 1,
      codigo: `PRD-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      descripcion: this.descripcion,
      idproducto: 0,
      imagen: this.imagen,
      nombre: this.nombre,
      precio: this.precio,
      ruta: this.nombre.toLowerCase().replace(/\s+/g, '-'),
      status: 1,
      stock: this.stock,
    };

    this.apiService
      .post(
        'https://backend-abimar.onrender.com/abimar/core/api/producto/create',
        producto
      )
      .subscribe(
        () => {
          this.resetForm();
          this.loadProductos();
        },
        (err) => console.error('Error creando producto:', err)
      );
  }

  editProducto(p: any) {
    this.editId = p.idproducto;
    this.nombre = p.nombre;
    this.descripcion = p.descripcion;
    this.precio = p.precio;
    this.stock = p.stock;

    const imgPath = (p.imagen || '').toString();
    this.imagen = imgPath ? imgPath.split('/').pop() || '' : '';

    this.originalData = { ...p };
  }

  updateProducto() {
    if (!this.editId) return;

    const producto = {
      categoriaId: this.originalData.categoriaId,
      codigo: this.originalData.codigo,
      dateCreated: this.originalData.dateCreated,
      descripcion: this.descripcion,
      idproducto: this.editId,
      imagen: this.imagen,
      nombre: this.nombre,
      precio: this.precio,
      ruta: this.nombre.toLowerCase().replace(/\s+/g, '-'),
      status: this.originalData.status,
      stock: this.stock,
    };

    this.apiService
      .post(
        'https://backend-abimar.onrender.com/abimar/core/api/producto/update',
        producto
      )
      .subscribe(
        () => {
          this.resetForm();
          this.loadProductos();
        },
        (err) => console.error('Error actualizando producto:', err)
      );
  }

  deleteProducto(id: number) {
    this.apiService
      .post(
        `https://backend-abimar.onrender.com/abimar/core/api/producto/delete?id=${id}`,
        {}
      )
      .subscribe(
        () => this.loadProductos(),
        (err) => console.error('Error eliminando producto:', err)
      );
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.nombre = '';
    this.descripcion = '';
    this.precio = 0;
    this.stock = 0;
    this.imagen = '';
    this.editId = null;
    this.originalData = {};
  }

  productosFiltrados() {
    if (!this.searchTerm) return this.productos;
    const term = this.searchTerm.toLowerCase();
    return this.productos.filter(
      (p) =>
        (p.nombre || '').toLowerCase().includes(term) ||
        (p.descripcion || '').toLowerCase().includes(term)
    );
  }
}
