import { Component, OnInit } from '@angular/core';
import { NavController, MenuController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { UtilService } from '../util.service';
import { LoaderService } from '../services/ui/loader.service';
import { ApiService } from '../services/api.service';
import { FavoritesService } from '../services/favorites.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  loading = false;
  submitted = false;

  private readonly adminEmail = 'jorge.maldonado@hotmail.com';

  constructor(
    private util: UtilService,
    private navCtrl: NavController,
    private menu: MenuController,
    private toastCtrl: ToastController,
    private http: HttpClient,
    private loader: LoaderService,
    private api: ApiService<any>,
    private favorites: FavoritesService,
    private cart: CartService
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.menu.enable(false, 'mainMenu');
    this.util.setMenuState(false);
    this.util.setShowIcons(false);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get emailInvalid(): boolean {
    if (!this.submitted) return false;
    const value = this.email.trim();
    if (!value) return true;
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  get passwordInvalid(): boolean {
    return this.submitted && !this.password.trim();
  }

  async login() {
    if (this.loading) return;

    this.submitted = true;
    this.errorMessage = '';

    if (this.emailInvalid || this.passwordInvalid) {
      this.errorMessage = 'Revisa tu correo y contraseña.';
      return;
    }

    const payload = {
      emailUser: this.email.trim(),
      password: this.password
    };

    this.loading = true;
    await this.loader.show('Iniciando sesión...');

    this.http.post(
      this.api.url('login'),
      payload,
      {
        observe: 'response',
        responseType: 'text'
      }
    ).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: async (response) => {
        await this.loader.hide();

        if (response.status !== 200) {
          this.errorMessage = 'No se pudo iniciar sesión.';
          return;
        }

        const body = response.body || '';
        const personalId = body.split(',')[1]?.trim() || '';
        const isAdmin = this.email.trim().toLowerCase() === this.adminEmail;

        this.util.setGuest(false);
        this.util.setShowIcons(true);

        if (isAdmin) {
          localStorage.setItem('adminUsuario', this.email.trim());
          localStorage.setItem('adminPersonal', personalId);
          this.util.setMenuState(false);
          await this.menu.enable(false, 'mainMenu');
          await this.toast('¡Bienvenido Admin!');
          this.navCtrl.navigateRoot('/admin-home', { animationDirection: 'forward' });
          return;
        }

        localStorage.setItem('usuario', this.email.trim());
        localStorage.setItem('guestAccess', 'false');
        localStorage.setItem('personal', personalId);
        this.util.setMenuState(true);
        await this.menu.enable(true, 'mainMenu');
        this.favorites.setOwner(this.email.trim());
        this.cart.setOwner(personalId);
        await this.toast('Sesión iniciada');
        this.navCtrl.navigateRoot('/home', { animationDirection: 'forward' });
      },
      error: async (error) => {
        await this.loader.hide();
        if (error?.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        } else {
          this.errorMessage = 'No se pudo conectar con el servidor.';
        }
      }
    });
  }

  async continueAsGuest() {
    localStorage.setItem('guestAccess', 'true');
    this.util.setGuest(true);
    this.util.setMenuState(true);
    this.util.setShowIcons(false);
    this.favorites.clearSession();
    this.cart.clearSession();
    await this.menu.enable(true, 'mainMenu');
    this.navCtrl.navigateRoot('/home', { animationDirection: 'forward' });
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({
      message,
      duration: 1800,
      color: 'dark',
      position: 'bottom'
    });
    await t.present();
  }
}
