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

  /** Código público único para el cliente (WhatsApp / UI). */
  generarCodigoPedido(): string {
    const time = Date.now().toString(36).toUpperCase().slice(-5);
    const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    return `ABI-${time}${rand}`;
  }

  /**
   * Resuelve el código visible de un pedido.
   * Preferencia: referenciaCobro (ABI-…) → fallback no secuencial desde id.
   */
  codigoPublico(pedidoOrId: any): string {
    if (pedidoOrId == null || pedidoOrId === '') {
      return '';
    }

    if (typeof pedidoOrId === 'string' && /^ABI-/i.test(pedidoOrId.trim())) {
      return pedidoOrId.trim().toUpperCase();
    }

    const pedido = typeof pedidoOrId === 'object' ? pedidoOrId : null;
    const ref = String(pedido?.referenciaCobro || '').trim();
    if (ref && !/^compra\s*app$/i.test(ref) && ref.toUpperCase() !== 'COMPRA APP') {
      return ref.toUpperCase().startsWith('ABI-') ? ref.toUpperCase() : ref;
    }

    const id = Number(
      pedido?.idpedido ??
      pedido?.id ??
      (typeof pedidoOrId === 'number' || /^\d+$/.test(String(pedidoOrId)) ? pedidoOrId : 0)
    );

    if (!id) {
      return ref || '';
    }

    // Legacy: código estable no-secuencial a partir del id (base36)
    return `ABI-${id.toString(36).toUpperCase().padStart(5, '0')}`;
  }
}