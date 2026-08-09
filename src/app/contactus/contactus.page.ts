import { Component } from '@angular/core';
import { MenuController, ToastController } from '@ionic/angular';
import { UtilService } from '../util.service';

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
      value: '+591 7000 0000',
      hint: 'Respuesta rápida',
      href: 'https://wa.me/59170000000'
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
    private util: UtilService
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
      ...this.contact,
      name: this.contact.name.trim(),
      email: this.contact.email.trim(),
      phone: this.contact.phone.trim(),
      message: this.contact.message.trim(),
      fecha: new Date().toISOString()
    };

    try {
      const prev = JSON.parse(localStorage.getItem('contactos') || '[]');
      const lista = Array.isArray(prev) ? prev : [];
      lista.unshift(payload);
      localStorage.setItem('contactos', JSON.stringify(lista.slice(0, 50)));
    } catch {
      localStorage.setItem('contactos', JSON.stringify([payload]));
    }

    await new Promise(r => setTimeout(r, 450));

    this.sending = false;
    this.success = true;
    this.submitted = false;
    this.contact = { name: '', email: '', phone: '', message: '' };

    const toast = await this.toastCtrl.create({
      message: 'Mensaje registrado. Te contactaremos pronto.',
      duration: 2500,
      color: 'success',
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}
