import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  nombres: string = '';
  apellidos: string = '';
  documento: string = '';
  telefono: number | null = null;
  idRol: number | null = null;
  email: string = '';
  password: string = '';

  usuarios: any[] = [];
  roles: any[] = [];
  editId: number | null = null;
  originalData: any = {};
  searchTerm: string = '';

  constructor(
    private apiService: ApiService<any>,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadRoles();
    this.loadUsuarios();
  }

  // 🔹 Cargar roles
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

  // 🔹 Cargar y combinar personas con sus usuarios
  async loadUsuarios() {
    try {
      const personas: any = await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/persona/list', {})
        .toPromise();

      const usuariosLogin: any = await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/usuario/list', {})
        .toPromise();

      const listaPersonas = Array.isArray(personas) ? personas : personas ? [personas] : [];
      const listaUsuarios = Array.isArray(usuariosLogin) ? usuariosLogin : usuariosLogin ? [usuariosLogin] : [];

      this.usuarios = listaPersonas.map((p) => {
        const login = listaUsuarios.find((u) => Number(u.personal) === Number(p.idpersona));
        return {
          ...p,
          emailUser: login ? login.emailUser : '',
          idusuario: login ? login.idusuario : null,
          token: login ? login.token : null,
        };
      });

      console.log('Usuarios combinados:', this.usuarios);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  }

  // 🔹 Crear usuario y su login
  async createUsuario() {
    if (!this.idRol) {
      this.showAlert('Error', 'Debe seleccionar un rol antes de crear el usuario');
      return;
    }
    if (!this.email.trim() || !this.password.trim()) {
      this.showAlert('Error', 'Debe ingresar correo y contraseña');
      return;
    }

    const persona = {
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
      tipoDocumentoId: 1,
    };

    try {
      const personaResp: any = await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/persona/create', persona)
        .toPromise();

      const loginData = {
        emailUser: this.email,
        password: this.password,
        token: this.generateToken(32),
        personal: personaResp.idpersona,
      };

      await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/usuario/create', loginData)
        .toPromise();

      await this.showAlert(
        '¡Usuario creado!',
        `Usuario creado correctamente.<br><b>Correo:</b> ${loginData.emailUser}`
      );

      this.resetForm();
      this.loadUsuarios();
    } catch (error) {
      console.error('Error creando usuario:', error);
      this.showAlert('Error', 'No se pudo crear el usuario o su login.');
    }
  }

  // 🔹 Editar usuario
  editUsuario(u: any) {
    this.editId = u.idpersona;
    this.nombres = u.nombres || '';
    this.apellidos = u.apellidos || '';
    this.documento = u.documento || '';
    this.telefono = u.telefono ?? null;
    this.idRol = u.rolId ? Number(u.rolId) : null;
    this.email = u.emailUser || '';
    this.password = '';
    this.originalData = { ...u };
  }

  // 🔹 Actualizar usuario
  async updateUsuario() {
    if (!this.editId) return;

    const persona = {
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
      tipoDocumentoId: this.originalData.tipoDocumentoId ?? 1,
    };

    try {
      await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/persona/update', persona)
        .toPromise();

      if (this.email.trim()) {
        const loginData: any = {
          idusuario: this.originalData.idusuario,
          personal: this.editId,
          emailUser: this.email,
        };
        if (this.password.trim()) loginData.password = this.password;

        await this.apiService
          .post('https://backend-abimar.onrender.com/abimar/core/api/usuario/update', loginData)
          .toPromise();
      }

      await this.showAlert('Actualizado', 'Los datos del usuario se han actualizado correctamente.');
      this.resetForm();
      this.loadUsuarios();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      this.showAlert('Error', 'No se pudo actualizar la persona o el login.');
    }
  }

  // 🔹 Eliminar usuario (persona + login)
  async deleteUsuario(u: any) {
    const confirm = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Seguro que deseas eliminar al usuario <b>${u.nombres} ${u.apellidos}</b>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              console.log('Intentando eliminar:', {
                idpersona: u.idpersona,
                idusuario: u.idusuario
              });

              // 🔸 1. Eliminar login primero (si existe)
              if (u.idusuario) {
                await this.apiService
                  .post(
                    `https://backend-abimar.onrender.com/abimar/core/api/usuario/delete?id=${u.idusuario}`,
                    {}
                  )
                  .toPromise();
                console.log('Login eliminado correctamente');
              }

              // 🔸 2. Eliminar persona
              await this.apiService
                .post(
                  `https://backend-abimar.onrender.com/abimar/core/api/persona/delete?id=${u.idpersona}`,
                  {}
                )
                .toPromise();
              console.log('Persona eliminada correctamente');

              await this.showAlert('Eliminado', 'Usuario eliminado correctamente.');
              this.loadUsuarios();
            } catch (error) {
              console.error('Error eliminando usuario:', error);
              if (error.error) console.error('Detalle del error:', error.error);
              this.showAlert('Error', 'No se pudo eliminar el usuario. Ver consola para detalles.');
            }
          },
        },
      ],
    });

    await confirm.present();
  }

  // 🔹 Mostrar nombre del rol
  getRoleName(rolId: any) {
    if (rolId === null || rolId === undefined) return '-';
    const r = this.roles.find((x) => Number(x.idrol) === Number(rolId));
    return r ? r.descripcion || r.nombre || `Rol ${r.idrol}` : String(rolId);
  }

  // 🔹 Filtrar usuarios
  usuariosFiltrados() {
    if (!this.searchTerm) return this.usuarios;
    const term = this.searchTerm.toLowerCase();
    return this.usuarios.filter(
      (u) =>
        (`${u.nombres || ''} ${u.apellidos || ''}`.toLowerCase().includes(term)) ||
        (u.documento || '').toLowerCase().includes(term)
    );
  }

  // 🔹 Utilidades
  private generateToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      backdropDismiss: true,
      buttons: ['Aceptar'],
    });
    await alert.present();
  }

  resetForm() {
    this.nombres = '';
    this.apellidos = '';
    this.documento = '';
    this.telefono = null;
    this.idRol = null;
    this.email = '';
    this.password = '';
    this.editId = null;
    this.originalData = {};
  }
}
