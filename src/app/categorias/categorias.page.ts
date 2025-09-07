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

  constructor(private apiService: ApiService<any>) {}

  ngOnInit() {
    this.loadCategorias();
  }

  loadCategorias() {
    this.apiService.get('https://backend-abimar.onrender.com/abimar/core/api/categoria/read?id=0')
      .subscribe(
        (res: any) => {
          this.categorias = Array.isArray(res) ? res : [res];
        },
        err => console.error('Error cargando categorías:', err)
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

    this.apiService.post('https://backend-abimar.onrender.com/abimar/core/api/categoria/create', categoria)
      .subscribe(
        () => {
          this.nombre = '';
          this.descripcion = '';
          this.loadCategorias();
        },
        err => console.error('Error creando categoría:', err)
      );
  }

  deleteCategoria(id: number) {
    this.apiService.delete(`https://backend-abimar.onrender.com/abimar/core/api/categoria/delete?id=${id}`)
      .subscribe(
        () => this.loadCategorias(),
        err => console.error('Error eliminando categoría:', err)
      );
  }
}
