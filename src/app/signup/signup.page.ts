import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { SignupRequest } from '../models/signup-request.model';
import { MenuController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  email: string = '';
  password: string = '';
  fullName: string = '';
  showPassword: boolean = false;

  constructor(
    private apiService: ApiService<SignupRequest>,
    private menu: MenuController,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // Asegurarse de que el menú lateral esté deshabilitado al entrar
    this.menu.enable(false);
  }

  ionViewWillEnter() {
    // Deshabilita el menú lateral al entrar
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    // Habilita el menú al salir de esta página
    this.menu.enable(true);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async signup() {
    // Validaciones
    if (!this.fullName.trim()) {
      alert('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!this.email.trim()) {
      alert('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      alert('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (!this.password.trim()) {
      alert('Por favor ingresa tu contraseña.');
      return;
    }

    const signupData: SignupRequest = {
      emailUser: this.email,
      password: this.password,
      token: this.generateToken(32),
      personal: 1
    };

    this.apiService.post(
      'https://backend-abimar.onrender.com/abimar/core/api/usuario/create',
      signupData
    ).subscribe(
      async response => {
        console.log('Signup exitoso:', response);

        // Limpiar campos
        this.email = '';
        this.password = '';
        this.fullName = '';

        // Mostrar ALERT de éxito centrado y bloquear fondo
        const alert = await this.alertCtrl.create({
          header: '¡Registro exitoso!',
          message: 'Serás redirigido al login.',
          backdropDismiss: false, // Bloquea cerrar al tocar el fondo
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                this.router.navigate(['/login']); // Redirige al login
              }
            }
          ]
        });
        await alert.present();
      },
      async error => {
        console.error('Error al hacer Signup:', error);

        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Ocurrió un error al registrarse. Intenta de nuevo.',
          backdropDismiss: true,
          buttons: ['Aceptar']
        });
        await alert.present();
      }
    );
  }

  generateToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;
    return regex.test(email);
  }

}
