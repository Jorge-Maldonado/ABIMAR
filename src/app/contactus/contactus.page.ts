import { Component } from '@angular/core';
import { MenuController, ToastController } from '@ionic/angular';
import { UtilService } from '../util.service';
import { ContactoService } from '../services/contacto.service';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.page.html',
  styleUrls: ['./contactus.page.scss'],
})
export class ContactusPage {

  contact = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  sending = false;
  success = false;
  submitted = false;

  readonly canales = [
    {
      icon: 'logo-whatsapp',
      title: 'WhatsApp',
      value: '+591 73283217',
      hint: 'Respuesta rápida',
      href: 'https://wa.me/59173283217'
    },
    {
      icon: 'mail-outline',
      title: 'Correo',
      value: 'soporte@abimar.shop',
      hint: 'Lun–Vie · 9:00–18:00',
      href: 'mailto:soporte@abimar.shop'
    },
    {
      icon: 'location-outline',
      title: 'Ubicación',
      value: 'Santa Cruz, Bolivia',
      hint: 'Retiros y envíos',
      href: null
    }
  ];

  constructor(
    private toastCtrl: ToastController,
    private menu: MenuController,
    private util: UtilService,
    private contactoService: ContactoService
  ) {}

  ionViewWillEnter() {
    this.util.setMenuState(true);
    this.menu.enable(true, 'mainMenu');
  }

  get formValid(): boolean {
    return !!(
      this.contact.name.trim() &&
      this.isValidEmail(this.contact.email) &&
      this.contact.message.trim().length >= 10
    );
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  }

  openCanal(href: string | null) {
    if (!href) return;
    window.open(href, '_blank', 'noopener');
  }

  async sendMessage() {
    this.submitted = true;
    this.success = false;

    if (!this.formValid || this.sending) {
      return;
    }

    this.sending = true;

    const payload = {
      idcontacto: 0,
      nombre: this.contact.name.trim(),
      correo: this.contact.email.trim(),
      telefono: this.contact.phone.trim() || '',
      mensaje: this.contact.message.trim(),
      fecha: new Date().toISOString(),
      estado: 1
    };

    this.contactoService.crear(payload).subscribe({
      next: async () => {
        this.sending = false;
        this.success = true;
        this.submitted = false;
        this.contact = { name: '', email: '', phone: '', message: '' };
        await this.showToast('Mensaje enviado. Te contactaremos pronto.', 'success');
      },
      error: async (err) => {
        console.error('Error enviando contacto:', err);
        this.sending = false;
        await this.showToast('No se pudo enviar el mensaje. Intenta de nuevo.', 'danger');
      }
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}
