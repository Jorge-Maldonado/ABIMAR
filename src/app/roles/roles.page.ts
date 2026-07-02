import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.page.html',
  styleUrls: ['./roles.page.scss'],
})
export class RolesPage implements OnInit {

  descripcion = '';
  estado = 1;

  roles: any[] = [];

  editId: number | null = null;

  searchTerm = '';

  loading = false;

  constructor(
    private apiService: ApiService<any>
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  //====================================================
  // LISTAR
  //====================================================

  loadRoles(): void {

    this.loading = true;

    this.apiService
      .post(
        'https://backend-abimar.onrender.com/abimar/core/api/rol/list',
        {}
      )
      .subscribe({

        next: (res: any) => {

          this.roles = Array.isArray(res)
            ? res
            : res
            ? [res]
            : [];

          this.loading = false;

        },

        error: (err) => {

          console.error(err);

          this.loading = false;

        }

      });

  }

  //====================================================
  // CREAR
  //====================================================

  createRole(): void {

    if (!this.descripcion.trim()) {
      return;
    }

    const payload = {

      idrol: 0,

      descripcion: this.descripcion.trim(),

      estado: this.estado

    };

    this.apiService
      .post(
        'https://backend-abimar.onrender.com/abimar/core/api/rol/create',
        payload
      )
      .subscribe({

        next: () => {

          this.resetForm();

          this.loadRoles();

        },

        error: (err) => console.error(err)

      });

  }

  //====================================================
  // EDITAR
  //====================================================

  editRole(role: any): void {

    this.editId = role.idrol;

    this.descripcion = role.descripcion;

    this.estado = role.estado;

    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });

  }

  //====================================================
  // ACTUALIZAR
  //====================================================

  updateRole(): void {

    if (!this.editId) {
      return;
    }

    const payload = {

      idrol: this.editId,

      descripcion: this.descripcion.trim(),

      estado: this.estado

    };

    this.apiService
      .post(
        'https://backend-abimar.onrender.com/abimar/core/api/rol/update',
        payload
      )
      .subscribe({

        next: () => {

          this.resetForm();

          this.loadRoles();

        },

        error: (err) => console.error(err)

      });

  }

  //====================================================
  // ELIMINAR
  //====================================================

  deleteRole(id: number): void {

    if (!confirm('¿Desea eliminar este rol?')) {
      return;
    }

    this.apiService
      .post(
        `https://backend-abimar.onrender.com/abimar/core/api/rol/delete?id=${id}`,
        {}
      )
      .subscribe({

        next: () => {

          this.loadRoles();

        },

        error: (err) => console.error(err)

      });

  }

  //====================================================
  // LIMPIAR
  //====================================================

  resetForm(): void {

    this.descripcion = '';

    this.estado = 1;

    this.editId = null;

  }

  //====================================================
  // BUSCADOR
  //====================================================

  rolesFiltrados(): any[] {

    if (!this.searchTerm.trim()) {
      return this.roles;
    }

    const term = this.searchTerm.toLowerCase();

    return this.roles.filter(r =>
      (r.descripcion || '')
        .toLowerCase()
        .includes(term)
    );

  }

}