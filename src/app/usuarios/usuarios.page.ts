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

  compareRol = (a: any, b: any): boolean => Number(a) === Number(b);

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

  rolesLoading = false;

  saving = false;

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

  ionViewWillEnter(): void {
    this.loadRoles();
  }

  get rolSelectOptions() {
    return {
      header: 'Elegir rol',
      subHeader: 'Asigna el permiso del usuario en el sistema',
      cssClass: 'rol-select-alert',
    };
  }

  get rolSeleccionadoNombre(): string {
    if (this.idRol == null) {
      return '';
    }
    const name = this.getRoleName(this.idRol);
    return name === '-' ? '' : name;
  }

  //====================================================
  // ROLES
  //====================================================

  loadRoles(): void {
    this.rolesLoading = true;
    this.apiService
      .post(this.apiService.url('rol/list'), {})
      .subscribe({
        next: (res: any) => {
          const lista = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
              ? res.data
              : res
                ? [res]
                : [];
          this.roles = lista
            .map((r) => ({
              ...r,
              idrol: Number(r.idrol ?? r.idRol ?? r.id ?? 0),
              descripcion: r.descripcion || r.nombre || `Rol #${r.idrol || ''}`,
              estado: Number(r.estado ?? r.status ?? 1),
            }))
            .filter((r) => r.idrol > 0 && r.estado === 1)
            .sort((a, b) =>
              String(a.descripcion).localeCompare(String(b.descripcion), 'es')
            );
          this.rolesLoading = false;
        },
        error: (err) => {
          console.error('Error cargando roles', err);
          this.roles = [];
          this.rolesLoading = false;
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
    if (this.saving) {
      return;
    }

    if (this.idRol == null) {
      await this.showAlert('Error', 'Debe seleccionar un rol antes de crear el usuario');
      return;
    }
    if (!this.email.trim()) {
      await this.showAlert('Error', 'Debe ingresar un correo electrónico');
      return;
    }
    if (!this.isValidEmail(this.email.trim())) {
      await this.showAlert('Error', 'El correo electrónico no es válido');
      return;
    }
    if (!this.password.trim()) {
      await this.showAlert('Error', 'Debe ingresar una contraseña');
      return;
    }
    if (this.password.trim().length < 6) {
      await this.showAlert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!this.nombres.trim()) {
      await this.showAlert('Error', 'Debe ingresar los nombres');
      return;
    }
    if (!this.apellidos.trim()) {
      await this.showAlert('Error', 'Debe ingresar los apellidos');
      return;
    }
    if (!String(this.documento || '').trim()) {
      await this.showAlert('Error', 'Debe ingresar el documento');
      return;
    }

    const documento = String(this.documento).trim();
    const persona = {
      nombres: this.nombres.trim(),
      apellidos: this.apellidos.trim(),
      documento,
      identificacion: documento,
      telefono: this.telefono != null && String(this.telefono).trim() !== ''
        ? Number(this.telefono)
        : null,
      estado: 1,
      fechaCreacion: new Date().toISOString(),
      razonSocial: `${this.nombres.trim()} ${this.apellidos.trim()}`,
      rolId: String(this.idRol),
      tipoDocumentoId: 1,
    };

    this.saving = true;
    try {
      const personaResp: any = await this.apiService
        .post(this.apiService.url('persona/create'), persona)
        .toPromise();

      const personalId = Number(
        personaResp?.idpersona ?? personaResp?.idPersona ?? 0
      );
      if (!personalId) {
        throw new Error('Respuesta de persona inválida');
      }

      const loginData = {
        emailUser: this.email.trim(),
        password: this.password.trim(),
        token: this.generateToken(32),
        personal: personalId,
      };

      await this.apiService
        .post(this.apiService.url('usuario/create'), loginData)
        .toPromise();

      await this.showAlert(
        '¡Usuario creado!',
        `Usuario creado correctamente.<br><b>Correo:</b> ${loginData.emailUser}`
      );
      this.resetForm();
      this.loadUsuarios();
    } catch (error) {
      console.error('Error creando usuario', error);
      await this.showAlert(
        'Error',
        this.createErrorMessage(error)
      );
    } finally {
      this.saving = false;
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private createErrorMessage(error: any): string {
    const status = error?.status;
    if (status === 409 || status === 400) {
      return 'No se pudo crear: el correo o el documento ya existen.';
    }
    if (status === 0) {
      return 'No hay conexión con el servidor. Intenta de nuevo.';
    }
    return 'No se pudo crear el usuario o su login.';
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