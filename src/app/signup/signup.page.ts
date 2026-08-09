import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { MenuController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  nombres: string = '';
  apellidos: string = '';
  documento: string = '';
  telefono: number | null = null;
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private apiService: ApiService<any>,
    private menu: MenuController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.menu.enable(false, 'mainMenu');
  }

  ionViewWillEnter() { this.menu.enable(false, 'mainMenu'); }
  ionViewWillLeave() { this.menu.enable(true, 'mainMenu'); }

  togglePassword() { this.showPassword = !this.showPassword; }

  async signup() {
    // Validaciones
    if (!this.nombres.trim() || !this.apellidos.trim()) {
      return this.showAlert('Error', 'Por favor ingresa nombres y apellidos.');
    }
    if (!this.email.trim() || !this.isValidEmail(this.email)) {
      return this.showAlert('Error', 'Correo electrónico inválido.');
    }
    if (!this.password.trim()) {
      return this.showAlert('Error', 'Ingresa tu contraseña.');
    }

    const persona = {
      nombres: this.nombres,
      apellidos: this.apellidos,
      documento: this.documento || '',
      telefono: this.telefono || null,
      estado: 1,
      fechaCreacion: new Date().toISOString(),
      identificacion: this.documento || '',
      razonSocial: `${this.nombres} ${this.apellidos}`,
      rolId: 1,
      tipoDocumentoId: 1
    };

    try {
      // Crear persona
      const personaResp: any = await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/persona/create', persona)
        .toPromise();

      // Crear login
      const loginData = {
        emailUser: this.email,
        password: this.password,
        token: this.generateToken(32),
        personal: personaResp.idpersona
      };

      await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/usuario/create', loginData)
        .toPromise();

      // Éxito
      const alert = await this.alertCtrl.create({
        header: '¡Registro exitoso!',
        message: 'Serás redirigido al login.',
        backdropDismiss: false,
        buttons: [{ text: 'Aceptar', handler: () => this.router.navigate(['/login']) }]
      });
      await alert.present();

      // Limpiar formulario
      this.resetForm();

    } catch (error) {
      console.error('Error creando usuario:', error);
      this.showAlert('Error', 'No se pudo crear la cuenta. Intenta de nuevo.');
    }
  }

  private showAlert(header: string, message: string) {
    return this.alertCtrl.create({ header, message, backdropDismiss: true, buttons: ['Aceptar'] })
      .then(alert => alert.present());
  }

  private generateToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  private isValidEmail(email: string) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/.test(email);
  }

  private resetForm() {
    this.nombres = '';
    this.apellidos = '';
    this.documento = '';
    this.telefono = null;
    this.email = '';
    this.password = '';
  }
}
