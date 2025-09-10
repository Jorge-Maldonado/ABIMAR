import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.page.html',
  styleUrls: ['./roles.page.scss'],
})
export class RolesPage implements OnInit {
  descripcion: string = '';
  estado: number = 1;
  roles: any[] = [];
  editId: number | null = null;
  originalData: any = {};
  searchTerm = '';

  constructor(private apiService: ApiService<any>) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/rol/list', {})
      .subscribe(
        (res: any) => { this.roles = Array.isArray(res) ? res : res ? [res] : []; },
        (err) => console.error('Error cargando roles:', err)
      );
  }

  createRole() {
    const rol = { descripcion: this.descripcion, estado: this.estado, idrol: 0 };
    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/rol/create', rol)
      .subscribe(
        () => { this.resetForm(); this.loadRoles(); },
        (err) => console.error('Error creando rol:', err)
      );
  }

  editRole(r: any) {
    this.editId = r.idrol;
    this.descripcion = r.descripcion || '';
    this.estado = r.estado ?? 1;
    this.originalData = { ...r };
  }

  updateRole() {
    if (!this.editId) return;
    const payload = {
      idrol: this.editId,
      descripcion: this.descripcion,
      estado: this.estado
    };
    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/rol/update', payload)
      .subscribe(
        () => { this.resetForm(); this.loadRoles(); },
        (err) => console.error('Error actualizando rol:', err)
      );
  }

  deleteRole(id: number) {
    this.apiService
      .post(`https://backend-abimar.onrender.com/abimar/core/api/rol/delete?id=${id}`, {})
      .subscribe(
        () => this.loadRoles(),
        (err) => console.error('Error eliminando rol:', err)
      );
  }

  resetForm() {
    this.descripcion = '';
    this.estado = 1;
    this.editId = null;
    this.originalData = {};
  }

  rolesFiltrados() {
    if (!this.searchTerm) return this.roles;
    const term = this.searchTerm.toLowerCase();
    return this.roles.filter(r =>
      (r.descripcion || '').toLowerCase().includes(term)
    );
  }
}
