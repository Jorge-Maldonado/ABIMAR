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

  constructor(private apiService: ApiService<any>) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    // si tu API devuelve lista completa, ajusta el endpoint
    this.apiService.get('https://backend-abimar.onrender.com/abimar/core/api/rol/read?id=0')
      .subscribe(
        (res: any) => {
          this.roles = Array.isArray(res) ? res : [res];
        },
        err => console.error('Error cargando roles:', err)
      );
  }

  createRole() {
    const rol = {
      descripcion: this.descripcion,
      estado: this.estado,
      idrol: 0
    };
    this.apiService.post('https://backend-abimar.onrender.com/abimar/core/api/rol/create', rol)
      .subscribe(
        () => {
          this.descripcion = '';
          this.estado = 1;
          this.loadRoles();
        },
        err => console.error('Error creando rol:', err)
      );
  }

  deleteRole(id: number) {
    this.apiService.delete(`https://backend-abimar.onrender.com/abimar/core/api/rol/delete?id=${id}`)
      .subscribe(
        () => this.loadRoles(),
        err => console.error('Error eliminando rol:', err)
      );
  }
}
