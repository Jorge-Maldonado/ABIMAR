import { Component, OnInit } from '@angular/core';
import { NavController, MenuController, AlertController } from '@ionic/angular';
import { UtilService } from '../util.service';
import { HttpClient } from '@angular/common/http';
import { LoaderService } from '../services/ui/loader.service'; // ✅ IMPORTANTE

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email = '';
  password = '';
  showPassword: boolean = false;
  isGuest: boolean = false;
  errorMessage: string = '';
  loading: boolean = false; // ✅ control UI

  constructor(
    private util: UtilService,
    private navCtrl: NavController,
    private menu: MenuController,
    private alertCtrl: AlertController,
    private http: HttpClient,
    private loader: LoaderService // ✅ INYECCIÓN
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.menu.enable(false);
    this.util.setMenuState(false);
    this.util.setShowIcons(false);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {

    if (this.loading) return; // 🚫 evita doble click

    if (!this.email.trim() || !this.password.trim()) {
      this.showAlert('Error', 'Ingresa correo y contraseña');
      return;
    }

    const payload = {
      emailUser: this.email,
      password: this.password
    };

    try {
      this.loading = true;

      await this.loader.show('Iniciando sesión...'); // 🔥 LOADER ON

      this.http.post(
        'https://backend-abimar.onrender.com/abimar/core/api/login',
        payload,
        {
          observe: 'response',
          responseType: 'text'
        }
      ).subscribe(

        async (response) => {

          if (response.status === 200) {

            localStorage.setItem('usuario', this.email);
            localStorage.setItem('guestAccess', 'false');

            this.isGuest = false;
            this.util.setGuest(false);
            this.util.setMenuState(true);
            this.menu.enable(true);
            this.util.setShowIcons(true);

            await this.loader.hide(); // 🔥 IMPORTANTE antes del alert

            if (this.email === 'jorge.maldonado@hotmail.com') {

              const alert = await this.alertCtrl.create({
                header: '¡Bienvenido Admin!',
                message: 'Serás redirigido al panel de administración.',
                backdropDismiss: false,
                buttons: [{
                  text: 'Aceptar',
                  handler: () => this.navCtrl.navigateRoot('/admin-home', { animationDirection: 'forward' })
                }]
              });

              await alert.present();

            } else {

              const alert = await this.alertCtrl.create({
                header: '¡Login exitoso!',
                message: 'Serás redirigido al inicio.',
                backdropDismiss: false,
                buttons: [{
                  text: 'Aceptar',
                  handler: () => this.navCtrl.navigateRoot('/home', { animationDirection: 'forward' })
                }]
              });

              await alert.present();
            }
          }
        },

        async (error) => {

          await this.loader.hide(); // 🔥 SIEMPRE cerrar loader

          if (error.status === 401) {
            this.showAlert('Error', 'Usuario o contraseña incorrectos');
          } else {
            this.showAlert('Error', 'No se pudo conectar con el servidor');
          }
        },

        () => {
          this.loading = false; // ✅ reset UI
        }
      );

    } catch (err) {
      await this.loader.hide();
      this.loading = false;
      this.showAlert('Error', 'Error inesperado');
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      backdropDismiss: true,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
}