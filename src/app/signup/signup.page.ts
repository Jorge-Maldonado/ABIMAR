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
  email = 'Prueba';
  password = 'Pruebabss';

  constructor(private apiService: ApiService<SignupRequest>) {}

  signup(){
    const signupData: SignupRequest = {
      title: this.email,
      description : this.password
    }
  

  this.apiService.post('http://localhost:8080/api/tutorials', signupData)
      .subscribe(
        response => console.log('Signup exitoso:', response),
        error => console.error('Error al hacer Signup:', error)
      );
  }  
}
