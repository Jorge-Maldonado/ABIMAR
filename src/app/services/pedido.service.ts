import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private API = 'https://backend-abimar.onrender.com/abimar/core/api';

  constructor(private http: HttpClient) {}

  listarPedidos(): Observable<any[]> {
    return this.http.post<any[]>(`${this.API}/pedido/list`, {});
  }
}