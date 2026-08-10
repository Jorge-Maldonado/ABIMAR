import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { MenuController, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilService } from '../util.service';
import { LoaderService } from '../services/ui/loader.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  nombres = '';
  apellidos = '';
  documento = '';
  telefono = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private apiService: ApiService<any>,
    private menu: MenuController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    private util: UtilService,
    private loader: LoaderService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.util.setMenuState(false);
    this.util.setShowIcons(false);
    await this.menu.enable(false, 'mainMenu');
    await this.menu.close('mainMenu');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get nombresInvalid(): boolean {
    return this.submitted && !this.nombres.trim();
  }

  get apellidosInvalid(): boolean {
    return this.submitted && !this.apellidos.trim();
  }

  get documentoInvalid(): boolean {
    return this.submitted && !this.documento.trim();
  }

  get telefonoInvalid(): boolean {
    if (!this.submitted) return false;
    const value = this.telefono.trim();
    if (!value) return true;
    return !/^[0-9+\-\s]{7,20}$/.test(value);
  }

  get emailInvalid(): boolean {
    if (!this.submitted) return false;
    const value = this.email.trim();
    if (!value) return true;
    return !this.isValidEmail(value);
  }

  get passwordInvalid(): boolean {
    if (!this.submitted) return false;
    const value = this.password;
    if (!value.trim()) return true;
    return value.length < 6;
  }

  get confirmPasswordInvalid(): boolean {
    if (!this.submitted) return false;
    if (!this.confirmPassword.trim()) return true;
    return this.password !== this.confirmPassword;
  }

  get formInvalid(): boolean {
    return (
      !this.nombres.trim() ||
      !this.apellidos.trim() ||
      !this.documento.trim() ||
      !this.telefono.trim() ||
      !this.email.trim() ||
      !this.isValidEmail(this.email.trim()) ||
      !this.password.trim() ||
      this.password.length < 6 ||
      !this.confirmPassword.trim() ||
      this.password !== this.confirmPassword
    );
  }

  async signup() {
    if (this.loading) return;

    this.submitted = true;
    this.errorMessage = '';

    if (this.formInvalid) {
      this.errorMessage = 'Completa todos los campos correctamente.';
      return;
    }

    const persona = {
      nombres: this.nombres.trim(),
      apellidos: this.apellidos.trim(),
      documento: this.documento.trim(),
      telefono: this.telefono.trim(),
      estado: 1,
      fechaCreacion: new Date().toISOString(),
      identificacion: this.documento.trim(),
      razonSocial: `${this.nombres.trim()} ${this.apellidos.trim()}`,
      rolId: 1,
      tipoDocumentoId: 1
    };

    this.loading = true;
    await this.loader.show('Creando cuenta...');

    try {
      const personaResp: any = await this.apiService
        .post(this.apiService.url('persona/create'), persona)
        .toPromise();

      const personalId = personaResp?.idpersona;
      if (!personalId) {
        throw new Error('Respuesta de persona inválida');
      }

      const loginData = {
        emailUser: this.email.trim(),
        password: this.password,
        token: this.generateToken(32),
        personal: personalId
      };

      await this.apiService
        .post(this.apiService.url('usuario/create'), loginData)
        .toPromise();

      await this.loader.hide();
      this.loading = false;
      this.resetForm();

      const toast = await this.toastCtrl.create({
        message: 'Cuenta creada. Inicia sesión.',
        duration: 2200,
        color: 'dark',
        position: 'bottom'
      });
      await toast.present();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      console.error('Error creando usuario:', error);
      await this.loader.hide();
      this.loading = false;
      this.errorMessage = 'No se pudo crear la cuenta. Intenta de nuevo.';
      await this.showAlert('Error', this.errorMessage);
    }
  }

  private showAlert(header: string, message: string) {
    return this.alertCtrl
      .create({ header, message, backdropDismiss: true, buttons: ['Aceptar'] })
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
    this.telefono = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.submitted = false;
    this.errorMessage = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
  }
}
