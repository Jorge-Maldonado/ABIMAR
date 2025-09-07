import { Component, OnInit } from '@angular/core';

import { ApiService } from '../services/api.service';
import { SignupRequest } from '../models/signup-request.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  ngOnInit() {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  email = 'Prueba';
  password = 'Pruebabss';
  fullName: string = '';

  // 👇 variable para controlar la visibilidad
  showPassword: boolean = false;

  constructor(private apiService: ApiService<SignupRequest>) { }

  signup() {
    const signupData: SignupRequest = {
      emailUser: this.email,
      password: this.password,
      token: this.generateToken(32),
      personal: 0
    }


    this.apiService.post('https://backend-abimar.onrender.com/abimar/core/api/usuario/create', signupData)
      .subscribe(
        response => console.log('Signup exitoso:', response),
        error => console.error('Error al hacer Signup:', error)
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

}
