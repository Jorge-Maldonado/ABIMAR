import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
})
export class CategoriasPage implements OnInit {
  nombre: string = '';
  descripcion: string = '';
  categorias: any[] = [];
  editId: number | null = null;
  originalData: any = {};
  searchTerm = '';

  constructor(private apiService: ApiService<any>) {}

  ngOnInit() {
    this.loadCategorias();
  }

  loadCategorias() {
    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/categoria/list', {})
      .subscribe(
        (res: any) => {
          this.categorias = Array.isArray(res) ? res : res ? [res] : [];
        },
        (err) => console.error('Error cargando categorías:', err)
      );
  }

  createCategoria() {
    const categoria = {
      dateCreated: new Date().toISOString(),
      descripcion: this.descripcion,
      idcategoria: 0,
      nombre: this.nombre,
      ruta: this.nombre.toLowerCase().replace(/\s+/g, '-'),
      status: 1
    };

    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/categoria/create', categoria)
      .subscribe(
        () => {
          this.resetForm();
          this.loadCategorias();
        },
        (err) => console.error('Error creando categoría:', err)
      );
  }

  editCategoria(c: any) {
    this.editId = c.idcategoria;
    this.nombre = c.nombre || '';
    this.descripcion = c.descripcion || '';
    this.originalData = { ...c };
  }

  updateCategoria() {
    if (!this.editId) return;

    const payload = {
      idcategoria: this.editId,
      nombre: this.nombre,
      descripcion: this.descripcion,
      ruta: this.nombre.toLowerCase().replace(/\s+/g, '-'),
      dateCreated: this.originalData.dateCreated || new Date().toISOString(),
      status: this.originalData.status ?? 1
    };

    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/categoria/update', payload)
      .subscribe(
        () => {
          this.resetForm();
          this.loadCategorias();
        },
        (err) => console.error('Error actualizando categoría:', err)
      );
  }

  deleteCategoria(id: number) {
    this.apiService
      .post(`https://backend-abimar.onrender.com/abimar/core/api/categoria/delete?id=${id}`, {})
      .subscribe(
        () => this.loadCategorias(),
        (err) => console.error('Error eliminando categoría:', err)
      );
  }

  resetForm() {
    this.nombre = '';
    this.descripcion = '';
    this.editId = null;
    this.originalData = {};
  }

  categoriasFiltradas() {
    if (!this.searchTerm) return this.categorias;
    const term = this.searchTerm.toLowerCase();
    return this.categorias.filter(
      (c) =>
        (c.nombre || '').toLowerCase().includes(term) ||
        (c.descripcion || '').toLowerCase().includes(term)
    );
  }
}
