import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { ImageSelectorComponent } from '../components/image-selector/image-selector.component';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {
  nombre = '';
  descripcion = '';
  precio: number | null = null;
  stock: number | null = null;
  imagen = '';
  categoriaId: number | null = null;
  destacado = false;
  masVendido = false;

  productos: any[] = [];
  categorias: any[] = [];
  categoriasLoading = false;

  editId: number | null = null;
  originalData: any = {};

  searchTerm = '';
  filtroCategoria: number | 'ALL' = 'ALL';
  filtroStock: 'ALL' | 'LOW' | 'OUT' = 'ALL';
  filtroVitrine: 'ALL' | 'DESTACADO' | 'MAS_VENDIDO' = 'ALL';

  loading = false;
  saving = false;
  submitted = false;

  /** ion-select: evita fallos number vs string en el value. */
  compareCategoria = (a: any, b: any): boolean => Number(a) === Number(b);

  constructor(
    private apiService: ApiService<any>,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadProductos();
    this.loadCategorias();
  }

  ionViewWillEnter() {
    this.loadCategorias();
  }

  get countAll(): number {
    return this.productos.length;
  }

  get countActivos(): number {
    return this.productos.filter(p => Number(p.status) === 1).length;
  }

  get countStockBajo(): number {
    return this.productos.filter(p => {
      const s = Number(p.stock);
      return s > 0 && s <= 5;
    }).length;
  }

  get countDestacados(): number {
    return this.productos.filter(p => this.isFlagOn(p.destacado)).length;
  }

  get countMasVendidos(): number {
    return this.productos.filter(p => this.isFlagOn(p.masVendido)).length;
  }

  get formValid(): boolean {
    return (
      this.nombre.trim().length >= 2 &&
      this.categoriaId != null &&
      this.precio != null &&
      Number(this.precio) > 0 &&
      this.stock != null &&
      Number(this.stock) >= 0 &&
      !!this.imagen
    );
  }

  get imagenPreview(): string {
    return this.normalizeImagePath(this.imagen);
  }

  get categoriaSelectOptions() {
    return {
      header: 'Elegir categoría',
      subHeader: 'Clasifica el producto en el catálogo',
      cssClass: 'cat-select-alert',
    };
  }

  get categoriaSeleccionadaNombre(): string {
    if (this.categoriaId == null) return '';
    return this.getCategoriaNombre(this.categoriaId);
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

  async abrirSelectorImagen(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const modal = await this.modalCtrl.create({
      component: ImageSelectorComponent,
      cssClass: 'image-selector-modal',
      showBackdrop: true,
      backdropDismiss: true,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'ok' && data) {
      this.imagen = String(data);
    }
  }

  clearImagen(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.imagen = '';
  }

  loadProductos(event?: any) {
    if (!event) {
      this.loading = true;
    }

    this.apiService
      .post(this.apiService.url('producto/list'), {})
      .subscribe(
        (res: any) => {
          if (Array.isArray(res)) {
            this.productos = res.map((p) => ({
              ...p,
              destacado: this.readFlag(p, 'destacado'),
              masVendido: this.readFlag(p, 'masVendido', 'masvendido', 'mas_vendido'),
              imagen: this.normalizeImagePath(p.imagen),
              imagenFile: this.extractFileName(p.imagen),
            }));
          } else {
            this.productos = [];
          }
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
          await this.showToast('No se pudieron cargar los productos', 'danger');
        }
      );
  }

  loadCategorias() {
    this.categoriasLoading = true;
    this.apiService
      .post(this.apiService.url('categoria/list'), {})
      .subscribe(
        (res: any) => {
          const lista = Array.isArray(res) ? res : [];
          this.categorias = lista
            .map((c) => ({
              ...c,
              idcategoria: Number(
                c.idcategoria ?? c.idCategoria ?? c.id ?? 0
              ),
              nombre: c.nombre || `Categoría #${c.idcategoria || ''}`,
              status: Number(c.status ?? 1),
            }))
            .filter((c) => c.idcategoria > 0 && c.status === 1)
            .sort((a, b) =>
              String(a.nombre).localeCompare(String(b.nombre), 'es')
            );
          this.categoriasLoading = false;
        },
        async (err) => {
          console.error('Error cargando categorías:', err);
          this.categorias = [];
          this.categoriasLoading = false;
          await this.showToast('No se pudieron cargar las categorías', 'danger');
        }
      );
  }

  getCategoriaNombre(id: number): string {
    const cat = this.categorias.find(
      (c) => Number(c.idcategoria) === Number(id)
    );
    return cat ? cat.nombre : 'Sin categoría';
  }

  setFiltroCategoria(id: number | 'ALL') {
    this.filtroCategoria = id;
  }

  setFiltroStock(mode: 'ALL' | 'LOW' | 'OUT') {
    this.filtroStock = mode;
  }

  setFiltroVitrine(mode: 'ALL' | 'DESTACADO' | 'MAS_VENDIDO') {
    this.filtroVitrine = mode;
  }

  productosFiltrados(): any[] {
    let lista = [...this.productos];

    if (this.filtroCategoria !== 'ALL') {
      lista = lista.filter(p => Number(p.categoriaId) === Number(this.filtroCategoria));
    }

    if (this.filtroStock === 'LOW') {
      lista = lista.filter(p => {
        const s = Number(p.stock);
        return s > 0 && s <= 5;
      });
    } else if (this.filtroStock === 'OUT') {
      lista = lista.filter(p => Number(p.stock) <= 0);
    }

    if (this.filtroVitrine === 'DESTACADO') {
      lista = lista.filter(p => this.isFlagOn(p.destacado));
    } else if (this.filtroVitrine === 'MAS_VENDIDO') {
      lista = lista.filter(p => this.isFlagOn(p.masVendido));
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      lista = lista.filter(
        (p) =>
          (p.nombre || '').toLowerCase().includes(term) ||
          (p.descripcion || '').toLowerCase().includes(term) ||
          (p.codigo || '').toLowerCase().includes(term) ||
          this.getCategoriaNombre(p.categoriaId).toLowerCase().includes(term) ||
          String(p.idproducto || '').includes(term)
      );
    }

    return lista;
  }

  trackByProducto(_i: number, item: any) {
    return item.idproducto;
  }

  stockLabel(stock: any): string {
    const s = Number(stock);
    if (s <= 0) return 'Agotado';
    if (s <= 5) return `Bajo (${s})`;
    return `Stock ${s}`;
  }

  stockClass(stock: any): string {
    const s = Number(stock);
    if (s <= 0) return 'prod-card__badge--out';
    if (s <= 5) return 'prod-card__badge--low';
    return 'prod-card__badge--ok';
  }

  isActivo(p: any): boolean {
    return Number(p?.status) === 1;
  }

  /** Normaliza boolean / 0|1 / "true" del backend. */
  isFlagOn(val: any): boolean {
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
    // fallback: buscar key case-insensitive
    const lowerKeys = keys.map(k => k.toLowerCase());
    for (const k of Object.keys(obj)) {
      if (lowerKeys.includes(k.toLowerCase())) {
        return this.isFlagOn(obj[k]);
      }
    }
    return false;
  }

  async createProducto() {
    this.submitted = true;
    if (!this.formValid || this.saving) {
      return;
    }

    this.saving = true;
    const producto = {
      categoriaId: this.categoriaId,
      codigo: `PRD-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      descripcion: this.descripcion.trim(),
      idproducto: 0,
      imagen: this.imagen,
      nombre: this.nombre.trim(),
      precio: Number(this.precio),
      ruta: this.slugify(this.nombre),
      status: 1,
      stock: Number(this.stock),
      destacado: !!this.destacado,
      masVendido: !!this.masVendido,
    };

    this.apiService
      .post(this.apiService.url('producto/create'), producto)
      .subscribe(
        async () => {
          this.saving = false;
          this.resetForm();
          this.loadProductos();
          await this.showToast('Producto creado', 'success');
        },
        async (err) => {
          console.error('Error creando producto:', err);
          this.saving = false;
          await this.showToast('No se pudo crear el producto', 'danger');
        }
      );
  }

  editProducto(p: any) {
    this.editId = p.idproducto;
    this.nombre = p.nombre || '';
    this.descripcion = p.descripcion || '';
    this.precio = Number(p.precio) || 0;
    this.stock = Number(p.stock) || 0;
    this.categoriaId = p.categoriaId ?? null;
    this.imagen = p.imagenFile || this.extractFileName(p.imagen);
    this.destacado = this.readFlag(p, 'destacado');
    this.masVendido = this.readFlag(p, 'masVendido', 'masvendido', 'mas_vendido');
    this.originalData = { ...p };
    this.submitted = false;

    const formEl = document.getElementById('prod-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async updateProducto() {
    this.submitted = true;
    if (!this.editId || !this.formValid || this.saving) {
      return;
    }

    this.saving = true;
    const producto = {
      categoriaId: this.categoriaId,
      codigo: this.originalData.codigo || `PRD-${this.editId}`,
      dateCreated: this.originalData.dateCreated || new Date().toISOString(),
      descripcion: this.descripcion.trim(),
      idproducto: this.editId,
      imagen: this.imagen,
      nombre: this.nombre.trim(),
      precio: Number(this.precio),
      ruta: this.slugify(this.nombre),
      status: this.originalData.status ?? 1,
      stock: Number(this.stock),
      destacado: !!this.destacado,
      masVendido: !!this.masVendido,
    };

    this.apiService
      .post(this.apiService.url('producto/update'), producto)
      .subscribe(
        async () => {
          this.saving = false;
          this.resetForm();
          this.loadProductos();
          await this.showToast('Producto actualizado', 'success');
        },
        async (err) => {
          console.error('Error actualizando producto:', err);
          this.saving = false;
          await this.showToast('No se pudo actualizar', 'danger');
        }
      );
  }

  async confirmDelete(p: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar producto',
      message: `¿Eliminar <strong>${p.nombre}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteProducto(p.idproducto)
        }
      ]
    });
    await alert.present();
  }

  deleteProducto(id: number) {
    this.apiService
      .post(this.apiService.url(`producto/delete?id=${id}`), {})
      .subscribe(
        async () => {
          if (this.editId === id) {
            this.resetForm();
          }
          this.loadProductos();
          await this.showToast('Producto eliminado', 'warning');
        },
        async (err) => {
          console.error('Error eliminando producto:', err);
          await this.showToast('No se pudo eliminar', 'danger');
        }
      );
  }

  resetForm() {
    this.nombre = '';
    this.descripcion = '';
    this.precio = null;
    this.stock = null;
    this.imagen = '';
    this.categoriaId = null;
    this.destacado = false;
    this.masVendido = false;
    this.editId = null;
    this.originalData = {};
    this.submitted = false;
  }

  private extractFileName(val: any): string {
    if (!val) return '';
    const s = String(val).trim();
    return s.replace(/^.*[\\/]/, '');
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}
