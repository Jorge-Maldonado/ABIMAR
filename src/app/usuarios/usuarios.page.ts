import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  // formulario
  nombres: string = '';
  apellidos: string = '';
  documento: string = '';
  telefono: number | null = null;
  idRol: number | null = null;

  // listas
  usuarios: any[] = [];
  roles: any[] = [];

  editId: number | null = null;
  originalData: any = {};

  searchTerm = '';

  constructor(private apiService: ApiService<any>) {}

  ngOnInit() {
    this.loadRoles();
    this.loadUsuarios();
  }

  // Cargar roles (para el combo)
  loadRoles() {
    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/rol/list', {})
      .subscribe(
        (res: any) => {
          this.roles = Array.isArray(res) ? res : res ? [res] : [];
        },
        (err) => console.error('Error cargando roles:', err)
      );
  }

  // Cargar usuarios
  loadUsuarios() {
    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/persona/list', {})
      .subscribe(
        (res: any) => {
          this.usuarios = Array.isArray(res) ? res : res ? [res] : [];
        },
        (err) => console.error('Error cargando usuarios:', err)
      );
  }

  // crear
  createUsuario() {
    if (!this.idRol) {
      alert('Debe seleccionar un rol antes de crear el usuario');
      return;
    }

    const usuario = {
      apellidos: this.apellidos,
      documento: this.documento,
      estado: 1,
      fechaCreacion: new Date().toISOString(),
      identificacion: this.documento,
      idpersona: 0,
      nombres: this.nombres,
      razonSocial: `${this.nombres} ${this.apellidos}`,
      rolId: this.idRol,
      telefono: this.telefono,
      tipoDocumentoId: 1
    };

    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/persona/create', usuario)
      .subscribe(
        () => {
          this.resetForm();
          this.loadUsuarios();
        },
        (err) => console.error('Error creando usuario:', err)
      );
  }

  // preparar edición
  editUsuario(u: any) {
    this.editId = u.idpersona;
    this.nombres = u.nombres || '';
    this.apellidos = u.apellidos || '';
    this.documento = u.documento || '';
    this.telefono = u.telefono ?? null;
    this.idRol = u.rolId !== undefined && u.rolId !== null ? Number(u.rolId) : null;
    this.originalData = { ...u };
  }

  // actualizar
  updateUsuario() {
    if (!this.editId) return;
    if (!this.idRol) {
      alert('Debe seleccionar un rol antes de guardar los cambios');
      return;
    }

    const usuario = {
      idpersona: this.editId,
      nombres: this.nombres,
      apellidos: this.apellidos,
      documento: this.documento,
      telefono: this.telefono,
      identificacion: this.documento,
      razonSocial: `${this.nombres} ${this.apellidos}`,
      fechaCreacion: this.originalData.fechaCreacion || new Date().toISOString(),
      estado: this.originalData.estado ?? 1,
      rolId: this.idRol,
      tipoDocumentoId: this.originalData.tipoDocumentoId ?? 1
    };

    this.apiService
      .post('https://backend-abimar.onrender.com/abimar/core/api/persona/update', usuario)
      .subscribe(
        () => {
          this.resetForm();
          this.loadUsuarios();
        },
        (err) => console.error('Error actualizando usuario:', err)
      );
  }

  // eliminar
  deleteUsuario(id: number) {
    this.apiService
      .post(`https://backend-abimar.onrender.com/abimar/core/api/persona/delete?id=${id}`, {})
      .subscribe(
        () => this.loadUsuarios(),
        (err) => console.error('Error eliminando usuario:', err)
      );
  }

  // cancelar / limpiar
  resetForm() {
    this.nombres = '';
    this.apellidos = '';
    this.documento = '';
    this.telefono = null;
    this.idRol = null;
    this.editId = null;
    this.originalData = {};
  }

  // mostrar nombre del rol en la lista
  getRoleName(rolId: any) {
    if (rolId === null || rolId === undefined) return '-';
    const r = this.roles.find((x) => Number(x.idrol) === Number(rolId));
    return r ? (r.descripcion || r.nombre || `Rol ${r.idrol}`) : String(rolId);
  }

  // filtro
  usuariosFiltrados() {
    if (!this.searchTerm) return this.usuarios;
    const term = this.searchTerm.toLowerCase();
    return this.usuarios.filter(
      (u) =>
        (`${u.nombres || ''} ${u.apellidos || ''}`.toLowerCase().includes(term)) ||
        (u.documento || '').toLowerCase().includes(term)
    );
  }
}
