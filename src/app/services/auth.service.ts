import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ResetPasswordPayload {
  emailUser: string;
  documento: string;
  telefono: string;
  newPassword: string;
}

/**
 * Auth HTTP (recuperación de contraseña). Login sigue en LoginPage por contrato text/response.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private api: ApiService<any>
  ) {}

  resetPassword(payload: ResetPasswordPayload): Observable<string> {
    return this.http.post(
      this.api.url('usuario/reset-password'),
      payload,
      { responseType: 'text' }
    );
  }
}
