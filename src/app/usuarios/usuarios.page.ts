import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {

  //====================================================
  // FORMULARIO
  //====================================================

  nombres = '';
  apellidos = '';
  documento = '';
  telefono: number | null = null;

  idRol: number | null = null;

  email = '';
  password = '';

  //====================================================
  // DATOS
  //====================================================

  usuarios: any[] = [];

  roles: any[] = [];

  editId: number | null = null;

  searchTerm = '';

  loading = false;

  originalData: any = {};

  constructor(
    private apiService: ApiService<any>,
    private alertCtrl: AlertController
  ) { }

  //====================================================
  // INIT
  //====================================================

  ngOnInit(): void {

    this.loadRoles();

    this.loadUsuarios();

  }

  //====================================================
  // ROLES
  //====================================================

  loadRoles(): void {

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

        },

        error: (err) => {

          console.error('Error cargando roles', err);

        }

      });

  }

  //====================================================
  // USUARIOS
  //====================================================

  async loadUsuarios(): Promise<void> {

    this.loading = true;

    try {

      const personas: any = await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/persona/list', {})
        .toPromise();


      const usuariosLogin: any = await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/usuario/list', {})
        .toPromise();


      const listaPersonas = Array.isArray(personas)

        ? personas

        : personas

          ? [personas]

          : [];

      const listaUsuarios = Array.isArray(usuariosLogin)

        ? usuariosLogin

        : usuariosLogin

          ? [usuariosLogin]

          : [];

      //------------------------------------------------
      // MAP PARA EVITAR find() EN CADA ITERACIÓN
      //------------------------------------------------

      const loginMap = new Map<number, any>();

      listaUsuarios.forEach((u: any) => {

        loginMap.set(Number(u.personal), u);

      });

      //------------------------------------------------

      this.usuarios = listaPersonas.map((persona: any) => {

        const login = loginMap.get(Number(persona.idpersona));

        return {

          ...persona,

          emailUser: login?.emailUser || '',

          idusuario: login?.idusuario || null,

          token: login?.token || null

        };

      });

      console.log(

        'Usuarios combinados',

        this.usuarios

      );

    } catch (error) {

      console.error(

        'Error cargando usuarios',

        error

      );

    } finally {

      this.loading = false;

    }

  }

  //====================================================
  // CREAR
  //====================================================

  async createUsuario(): Promise<void> {

    if (!this.idRol) {

      this.showAlert(

        'Error',

        'Debe seleccionar un rol antes de crear el usuario'

      );

      return;

    }

    if (!this.email.trim()) {

      this.showAlert(

        'Error',

        'Debe ingresar un correo electrónico'

      );

      return;

    }

    if (!this.password.trim()) {

      this.showAlert(

        'Error',

        'Debe ingresar una contraseña'

      );

      return;

    }

    if (!this.nombres.trim()) {

      this.showAlert(

        'Error',

        'Debe ingresar los nombres'

      );

      return;

    }

    if (!this.apellidos.trim()) {

      this.showAlert(

        'Error',

        'Debe ingresar los apellidos'

      );

      return;

    }

    if (!this.documento.trim()) {

      this.showAlert(

        'Error',

        'Debe ingresar el documento'

      );

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

      //------------------------------------------------
      // CREAR PERSONA
      //------------------------------------------------

      const personaResp: any = await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/usuario/create', persona)
        .toPromise();

      //------------------------------------------------
      // CREAR LOGIN
      //------------------------------------------------

      const loginData = {

        emailUser: this.email.trim(),

        password: this.password,

        token: this.generateToken(32),

        personal: personaResp.idpersona,

      };

      await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/usuario/create', loginData)
        .toPromise();

      //------------------------------------------------

      await this.showAlert(

        '¡Usuario creado!',

        `Usuario creado correctamente.<br><b>Correo:</b> ${loginData.emailUser}`

      );

      this.resetForm();

      this.loadUsuarios();

    }

    catch (error) {

      console.error(

        'Error creando usuario',

        error

      );

      this.showAlert(

        'Error',

        'No se pudo crear el usuario o su login.'

      );

    }

  }

  //====================================================
  // EDITAR
  //====================================================

  editUsuario(usuario: any): void {

    this.editId = usuario.idpersona;

    this.nombres = usuario.nombres || '';

    this.apellidos = usuario.apellidos || '';

    this.documento = usuario.documento || '';

    this.telefono = usuario.telefono ?? null;

    this.idRol = usuario.rolId

      ? Number(usuario.rolId)

      : null;

    this.email = usuario.emailUser || '';

    this.password = '';

    //------------------------------------------------
    // SOLO LOS DATOS NECESARIOS
    //------------------------------------------------

    this.originalData = {

      idusuario: usuario.idusuario,

      fechaCreacion: usuario.fechaCreacion,

      estado: usuario.estado,

      tipoDocumentoId: usuario.tipoDocumentoId

    };

    //------------------------------------------------
    // UX
    //------------------------------------------------

    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });

  }

  //====================================================
  // ACTUALIZAR
  //====================================================

  async updateUsuario(): Promise<void> {

    if (!this.editId) {

      return;

    }

    const persona = {

      idpersona: this.editId,

      nombres: this.nombres,

      apellidos: this.apellidos,

      documento: this.documento,

      telefono: this.telefono,

      identificacion: this.documento,

      razonSocial: `${this.nombres} ${this.apellidos}`,

      fechaCreacion:

        this.originalData.fechaCreacion ||

        new Date().toISOString(),

      estado:

        this.originalData.estado ?? 1,

      rolId: this.idRol,

      tipoDocumentoId:

        this.originalData.tipoDocumentoId ?? 1,

    };

    try {

      //------------------------------------------------
      // PERSONA
      //------------------------------------------------

      await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/persona/update', persona)
        .toPromise();
      //------------------------------------------------
      // LOGIN
      //------------------------------------------------

      if (this.email.trim()) {

        const loginData: any = {

          idusuario: this.originalData.idusuario,

          personal: this.editId,

          emailUser: this.email.trim(),

        };

        if (this.password.trim()) {

          loginData.password = this.password;

        }

        await this.apiService
          .post('https://backend-abimar.onrender.com/abimar/core/api/usuario/update', loginData)
          .toPromise();

      }

      //------------------------------------------------

      await this.showAlert(

        'Actualizado',

        'Los datos del usuario se han actualizado correctamente.'

      );

      this.resetForm();

      this.loadUsuarios();

    }

    catch (error) {

      console.error(

        'Error actualizando usuario',

        error

      );

      this.showAlert(

        'Error',

        'No se pudo actualizar la persona o el login.'

      );

    }

  }

  //====================================================
  // ELIMINAR
  //====================================================

  async deleteUsuario(usuario: any): Promise<void> {

    const confirm = await this.alertCtrl.create({

      header: 'Confirmar eliminación',

      message:

        `¿Seguro que deseas eliminar al usuario <b>${usuario.nombres} ${usuario.apellidos}</b>?`,

      buttons: [

        {

          text: 'Cancelar',

          role: 'cancel'

        },

        {

          text: 'Eliminar',

          handler: async () => {

            try {

              //------------------------------------------------

              console.log(

                'Eliminando usuario',

                usuario

              );

              //------------------------------------------------
              // LOGIN
              //------------------------------------------------

              if (usuario.idusuario) {

                await this.apiService
                  .post(`https://backend-abimar.onrender.com/abimar/core/api/usuario/delete?id=${usuario.idusuario}`, {})
                  .toPromise();

              }

              //------------------------------------------------
              // PERSONA
              //------------------------------------------------

              await this.apiService
                .post(`https://backend-abimar.onrender.com/abimar/core/api/persona/delete?id=${usuario.idpersona}`, {})
                .toPromise();
              //------------------------------------------------

              await this.showAlert(

                'Eliminado',

                'Usuario eliminado correctamente.'

              );

              this.loadUsuarios();

            }

            catch (error) {

              console.error(

                'Error eliminando usuario',

                error

              );

              if (error?.error) {

                console.error(error.error);

              }

              this.showAlert(

                'Error',

                'No se pudo eliminar el usuario.'

              );

            }

          }

        }

      ]

    });

    await confirm.present();

  }

  //====================================================
  // ROL
  //====================================================

  getRoleName(rolId: any): string {

    if (rolId === null || rolId === undefined) {

      return '-';

    }

    const rol = this.roles.find(

      r => Number(r.idrol) === Number(rolId)

    );

    return rol

      ? rol.descripcion ||

      rol.nombre ||

      `Rol ${rol.idrol}`

      : String(rolId);

  }

  //====================================================
  // BUSCADOR
  //====================================================

  usuariosFiltrados(): any[] {

    if (!this.searchTerm.trim()) {

      return this.usuarios;

    }

    const term = this.searchTerm.toLowerCase();

    return this.usuarios.filter(usuario =>

      (`${usuario.nombres || ''} ${usuario.apellidos || ''}`

        .toLowerCase()

        .includes(term))

      ||

      (usuario.documento || '')

        .toLowerCase()

        .includes(term)

      ||

      (usuario.emailUser || '')

        .toLowerCase()

        .includes(term)

      ||

      String(usuario.telefono || '')

        .includes(term)

      ||

      this.getRoleName(usuario.rolId)

        .toLowerCase()

        .includes(term)

    );

  }
  //====================================================
  // TOKEN
  //====================================================

  private generateToken(length: number = 32): string {

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    return Array.from(

      { length },

      () => chars.charAt(

        Math.floor(Math.random() * chars.length)

      )

    ).join('');

  }

  //====================================================
  // ALERTAS
  //====================================================

  private async showAlert(

    header: string,

    message: string

  ): Promise<void> {

    const alert = await this.alertCtrl.create({

      header,

      message,

      backdropDismiss: true,

      buttons: [

        {

          text: 'Aceptar'

        }

      ]

    });

    await alert.present();

  }

  //====================================================
  // LIMPIAR FORMULARIO
  //====================================================

  resetForm(): void {

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