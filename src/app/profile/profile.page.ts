import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  usuario: any = {
    nombres: '',
    apellidos: '',
    documento: '',
    telefono: '',
    ciudad: '',
    genero: '',
    emailUser: ''
  };

  constructor(
    private apiService: ApiService<any>,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    try {
      const email = localStorage.getItem('usuario'); // guardado en login
      if (!email) {
        this.showAlert('Error', 'No se encontró el usuario logueado');
        return;
      }

      // 🔹 Obtener todos los usuarios
      const usuarios: any = await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/usuario/list', {})
        .toPromise();

      const userLogin = usuarios.find((u: any) => u.emailUser === email);
      if (!userLogin) {
        this.showAlert('Error', 'No se encontró la cuenta de usuario');
        return;
      }

      // 🔹 Obtener personas
      const personas: any = await this.apiService
        .post('https://backend-abimar.onrender.com/abimar/core/api/persona/list', {})
        .toPromise();

      const persona = personas.find((p: any) => Number(p.idpersona) === Number(userLogin.personal));
      if (!persona) {
        this.showAlert('Error', 'No se encontró el perfil asociado');
        return;
      }

      // 🔹 Combinar y mostrar
      this.usuario = {
        nombres: persona.nombres,
        apellidos: persona.apellidos,
        documento: persona.documento,
        telefono: persona.telefono,
        ciudad: persona.razonSocial || '',
        genero: persona.genero || 'No especificado',
        emailUser: userLogin.emailUser
      };

    } catch (error) {
      console.error('Error cargando perfil:', error);
      this.showAlert('Error', 'No se pudo cargar el perfil.');
    }
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
}
