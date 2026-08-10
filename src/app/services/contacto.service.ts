import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ContactoPayload {
  idcontacto?: number;
  nombre: string;
  correo: string;
  telefono?: string;
  mensaje: string;
  fecha: string;
  estado: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContactoService {

  constructor(private api: ApiService<any>) {}

  crear(payload: ContactoPayload): Observable<any> {
    return this.api.post(this.api.url('contacto/create'), payload);
  }

  listar(): Observable<any[]> {
    return this.api.post(this.api.url('contacto/list'), {});
  }

  actualizar(payload: ContactoPayload): Observable<any> {
    return this.api.post(this.api.url('contacto/update'), payload);
  }
}
