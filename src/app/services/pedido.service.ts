import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private API = 'https://backend-abimar.onrender.com/abimar/core/api';

  constructor(private http: HttpClient) { }

  listarPedidos(): Observable<any[]> {
    return this.http.post<any[]>(`${this.API}/pedido/list`, {});
  }

  getDetallePedido(pedidoId: number): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.API}/detallepedido/byPedido?pedidoId=${pedidoId}`,
      {}
    );
  }

  getPedidosByPersonal(personal: number) {
    return this.http.post<any[]>(
      `${this.API}/pedido/byPersonal?personal=${personal}`,
      {}
    );
  }
  
  getPedidoById(id: number) {
    return this.http.post<any>(
      `${this.API}/pedido/read?id=${id}`,
      {}
    );
  }

  updatePedido(pedido: any) {
    return this.http.post(
      `${this.API}/pedido/update`,
      pedido
    );
  }

  createPedido(payload: any) {
    return this.http.post<any>(
      `${this.API}/pedido/create`,
      payload
    );
  }

  createDetalle(detalle: any) {
    return this.http.post<any>(
      `${this.API}/detallepedido/create`,
      detalle
    );
  }
}