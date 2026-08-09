import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
})
export class CategoriasPage implements OnInit {

  nombre = '';
  descripcion = '';
  categorias: any[] = [];
  editId: number | null = null;
  originalData: any = {};
  searchTerm = '';
  loading = true;
  saving = false;
  submitted = false;

  constructor(
    private apiService: ApiService<any>,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadCategorias();
  }

  get countAll(): number {
    return this.categorias.length;
  }

  get countActivas(): number {
    return this.categorias.filter(c => Number(c.status) === 1).length;
  }

  get formValid(): boolean {
    return this.nombre.trim().length >= 2;
  }

  loadCategorias(event?: any) {
    if (!event) {
      this.loading = true;
    }

    this.apiService
      .post(this.apiService.url('categoria/list'), {})
      .subscribe(
        (res: any) => {
          this.categorias = Array.isArray(res) ? res : res ? [res] : [];
          this.loading = false;
          if (event) {
            event.target.complete();
          }
        },
        async (err) => {
          console.error('Error cargando categorías:', err);
          this.categorias = [];
          this.loading = false;
          if (event) {
            event.target.complete();
          }
          await this.showToast('No se pudieron cargar las categorías', 'danger');
        }
      );
  }

  categoriasFiltradas(): any[] {
    if (!this.searchTerm) {
      return this.categorias;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.categorias.filter(
      (c) =>
        (c.nombre || '').toLowerCase().includes(term) ||
        (c.descripcion || '').toLowerCase().includes(term) ||
        String(c.idcategoria || '').includes(term)
    );
  }

  trackByCategoria(_i: number, item: any) {
    return item.idcategoria;
  }

  async createCategoria() {
    this.submitted = true;
    if (!this.formValid || this.saving) {
      return;
    }

    this.saving = true;
    const categoria = {
      dateCreated: new Date().toISOString(),
      descripcion: this.descripcion.trim(),
      idcategoria: 0,
      nombre: this.nombre.trim(),
      ruta: this.slugify(this.nombre),
      status: 1
    };

    this.apiService
      .post(this.apiService.url('categoria/create'), categoria)
      .subscribe(
        async () => {
          this.saving = false;
          this.resetForm();
          this.loadCategorias();
          await this.showToast('Categoría creada', 'success');
        },
        async (err) => {
          console.error('Error creando categoría:', err);
          this.saving = false;
          await this.showToast('No se pudo crear la categoría', 'danger');
        }
      );
  }

  editCategoria(c: any) {
    this.editId = c.idcategoria;
    this.nombre = c.nombre || '';
    this.descripcion = c.descripcion || '';
    this.originalData = { ...c };
    this.submitted = false;

    const formEl = document.getElementById('cat-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async updateCategoria() {
    this.submitted = true;
    if (!this.editId || !this.formValid || this.saving) {
      return;
    }

    this.saving = true;
    const payload = {
      idcategoria: this.editId,
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim(),
      ruta: this.slugify(this.nombre),
      dateCreated: this.originalData.dateCreated || new Date().toISOString(),
      status: this.originalData.status ?? 1
    };

    this.apiService
      .post(this.apiService.url('categoria/update'), payload)
      .subscribe(
        async () => {
          this.saving = false;
          this.resetForm();
          this.loadCategorias();
          await this.showToast('Categoría actualizada', 'success');
        },
        async (err) => {
          console.error('Error actualizando categoría:', err);
          this.saving = false;
          await this.showToast('No se pudo actualizar', 'danger');
        }
      );
  }

  async confirmDelete(c: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar categoría',
      message: `¿Eliminar <strong>${c.nombre}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteCategoria(c.idcategoria)
        }
      ]
    });
    await alert.present();
  }

  deleteCategoria(id: number) {
    this.apiService
      .post(this.apiService.url(`categoria/delete?id=${id}`), {})
      .subscribe(
        async () => {
          if (this.editId === id) {
            this.resetForm();
          }
          this.loadCategorias();
          await this.showToast('Categoría eliminada', 'warning');
        },
        async (err) => {
          console.error('Error eliminando categoría:', err);
          await this.showToast('No se pudo eliminar', 'danger');
        }
      );
  }

  resetForm() {
    this.nombre = '';
    this.descripcion = '';
    this.editId = null;
    this.originalData = {};
    this.submitted = false;
  }

  statusLabel(status: any): string {
    return Number(status) === 1 ? 'Activa' : 'Inactiva';
  }

  isActiva(c: any): boolean {
    return Number(c?.status) === 1;
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
