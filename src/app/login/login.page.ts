import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private util: UtilService,
    private navCtrl: NavController, 
  ) { }

  ngOnInit() {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (this.email === 'jorge.maldonado@hotmail.com' && this.password === 'admin') {
      // habilitar menú
      this.util.setMenuState(true);
      // 👉 Ir al home del administrador
      this.navCtrl.navigateRoot('/admin-home', { animationDirection: 'forward' });
    } else {
      // habilitar menú
      this.util.setMenuState(true);
      // 👉 Ir al home normal (flujo anterior)
      this.navCtrl.navigateRoot('/home', { animationDirection: 'forward' });
    }
  }

}
