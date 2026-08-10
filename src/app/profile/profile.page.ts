import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController, ToastController } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { UtilService } from '../util.service';
import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  loading = true;
  usuario: any = {
    idpersona: null,
    nombres: '',
    apellidos: '',
    documento: '',
    telefono: '',
    emailUser: '',
  };

  constructor(
    private apiService: ApiService<any>,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private menu: MenuController,
    private util: UtilService,
    private router: Router,
    private favorites: FavoritesService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  ionViewWillEnter() {
    this.util.setMenuState(true);
    this.menu.enable(true, 'mainMenu');
    this.loadProfile();
  }

  get isGuest(): boolean {
    return localStorage.getItem('guestAccess') === 'true' || !localStorage.getItem('usuario');
  }

  get displayName(): string {
    const full = `${this.usuario.nombres || ''} ${this.usuario.apellidos || ''}`.trim();
    if (full) return full;
    const email = (this.usuario.emailUser || localStorage.getItem('usuario') || '').trim();
    if (!email) return 'Invitado';
    const local = email.split('@')[0] || email;
    return local.charAt(0).toUpperCase() + local.slice(1);
  }

  get initials(): string {
    const n = (this.usuario.nombres || '').trim();
    const a = (this.usuario.apellidos || '').trim();
    if (n || a) {
      return `${n.charAt(0)}${a.charAt(0)}`.toUpperCase() || 'A';
    }
    return (this.displayName.charAt(0) || 'A').toUpperCase();
  }

  get hasProfile(): boolean {
    return !!(this.usuario.nombres || this.usuario.emailUser);
  }

  loadProfile() {
    if (this.isGuest) {
      this.loading = false;
      this.usuario = {
        idpersona: null,
        nombres: '',
        apellidos: '',
        documento: '',
        telefono: '',
        emailUser: '',
      };
      return;
    }

    this.loading = true;
    const email = (localStorage.getItem('usuario') || '').trim();
    const personalId = Number(localStorage.getItem('personal') || 0);

    const asArray = (res: any) => (Array.isArray(res) ? res : []);

    forkJoin({
      usuarios: this.apiService.post(this.apiService.url('usuario/list'), {}).pipe(
        map(asArray),
        catchError(() => of([]))
      ),
      personas: this.apiService.post(this.apiService.url('persona/list'), {}).pipe(
        map(asArray),
        catchError(() => of([]))
      ),
    }).subscribe({
      next: ({ usuarios, personas }) => {
        let userLogin =
          (email && usuarios.find((u: any) =>
            String(u.emailUser || '').toLowerCase() === email.toLowerCase()
          )) ||
          (personalId && usuarios.find((u: any) => Number(u.personal) === personalId)) ||
          null;

        const personaId = Number(userLogin?.personal || personalId || 0);
        const persona =
          personas.find((p: any) => Number(p.idpersona) === personaId) || null;

        if (!persona && !userLogin) {
          this.loading = false;
          this.showToast('No se pudo cargar tu perfil', 'warning');
          return;
        }

        this.usuario = {
          idpersona: persona?.idpersona || personaId || null,
          nombres: persona?.nombres || '',
          apellidos: persona?.apellidos || '',
          documento: persona?.documento || persona?.identificacion || '',
          telefono: persona?.telefono || '',
          emailUser: userLogin?.emailUser || email,
        };

        if (personaId) {
          localStorage.setItem('personal', String(personaId));
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('No se pudo cargar el perfil', 'danger');
      },
    });
  }

  irAPedidos() {
    this.router.navigate(['/my-orders']);
  }

  irACarrito() {
    this.router.navigate(['/my-cart']);
  }

  irAContacto() {
    this.router.navigate(['/contactus']);
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  irAHome() {
    this.router.navigate(['/home']);
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Deseas salir de tu cuenta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          handler: () => {
            localStorage.removeItem('usuario');
            localStorage.removeItem('personal');
            localStorage.removeItem('guestAccess');
            this.util.setGuest(false);
            this.util.setMenuState(false);
            this.favorites.clearSession();
            this.router.navigate(['/login'], { replaceUrl: true });
          },
        },
      ],
    });
    await alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      color,
      position: 'bottom',
      cssClass: 'custom-toast',
    });
    await toast.present();
  }
}
