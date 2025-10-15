import { Component } from '@angular/core';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.page.html',
  styleUrls: ['./contactus.page.scss'],
})
export class ContactusPage {
  contact = {
    name: '',
    email: '',
    message: ''
  };

  success = false;

  constructor() {}

  sendMessage() {
    // Aquí puedes llamar a tu API con HttpClient
    console.log('Mensaje enviado', this.contact);

    this.success = true;
    this.contact = { name: '', email: '', message: '' };
  }
}
