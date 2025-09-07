import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {

  nombres: string = '';
  apellidos: string = '';
  documento: string = '';
  telefono: number = 0;

  usuarios: any[] = [];

  constructor(private apiService: ApiService<any>) {}

  ngOnInit() {
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.apiService.get('https://backend-abimar.onrender.com/abimar/core/api/persona/read?id=0')
      .subscribe(
        (res: any) => {
          this.usuarios = Array.isArray(res) ? res : [res];
        },
        err => console.error('Error cargando usuarios:', err)
      );
  }

  createUsuario() {
    const usuario = {
      apellidos: this.apellidos,
      documento: this.documento,
      estado: 1,
      fechaCreacion: new Date().toISOString(),
      identificacion: this.documento,
      idpersona: 0,
      nombres: this.nombres,
      razonSocial: this.nombres + ' ' + this.apellidos,
      rolId: '1', // por defecto
      telefono: this.telefono,
      tipoDocumentoId: 1
    };

    this.apiService.post('https://backend-abimar.onrender.com/abimar/core/api/persona/create', usuario)
      .subscribe(
        () => {
          this.nombres = '';
          this.apellidos = '';
          this.documento = '';
          this.telefono = 0;
          this.loadUsuarios();
        },
        err => console.error('Error creando usuario:', err)
      );
  }

  deleteUsuario(id: number) {
    this.apiService.delete(`https://backend-abimar.onrender.com/abimar/core/api/persona/delete?id=${id}`)
      .subscribe(
        () => this.loadUsuarios(),
        err => console.error('Error eliminando usuario:', err)
      );
  }
}
