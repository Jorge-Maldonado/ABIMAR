import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { UtilService } from '../util.service';
import { LoaderService } from '../services/ui/loader.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  email = '';
  documento = '';
  telefono = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private util: UtilService,
    private menu: MenuController,
    private toastCtrl: ToastController,
    private router: Router,
    private loader: LoaderService,
    private auth: AuthService
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

  get emailInvalid(): boolean {
    if (!this.submitted) return false;
    const value = this.email.trim();
    if (!value) return true;
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

  get passwordInvalid(): boolean {
    if (!this.submitted) return false;
    if (!this.password.trim()) return true;
    return this.password.length < 6;
  }

  get confirmPasswordInvalid(): boolean {
    if (!this.submitted) return false;
    if (!this.confirmPassword.trim()) return true;
    return this.password !== this.confirmPassword;
  }

  get formInvalid(): boolean {
    return (
      !this.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()) ||
      !this.documento.trim() ||
      !this.telefono.trim() ||
      !/^[0-9+\-\s]{7,20}$/.test(this.telefono.trim()) ||
      !this.password.trim() ||
      this.password.length < 6 ||
      !this.confirmPassword.trim() ||
      this.password !== this.confirmPassword
    );
  }

  async submit() {
    if (this.loading) return;

    this.submitted = true;
    this.errorMessage = '';

    if (this.formInvalid) {
      this.errorMessage = 'Completa todos los campos correctamente.';
      return;
    }

    this.loading = true;
    await this.loader.show('Actualizando contraseña...');

    this.auth.resetPassword({
      emailUser: this.email.trim(),
      documento: this.documento.trim(),
      telefono: this.telefono.trim(),
      newPassword: this.password
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: async () => {
        await this.loader.hide();
        const toast = await this.toastCtrl.create({
          message: 'Contraseña actualizada. Inicia sesión.',
          duration: 2200,
          color: 'dark',
          position: 'bottom'
        });
        await toast.present();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: async (err) => {
        await this.loader.hide();
        if (err?.status === 401) {
          this.errorMessage = 'No se pudo verificar la identidad.';
        } else if (err?.status === 400) {
          this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        } else {
          this.errorMessage = 'No se pudo conectar con el servidor.';
        }
      }
    });
  }
}
