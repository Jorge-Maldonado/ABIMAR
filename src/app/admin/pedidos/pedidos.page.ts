import {
  Component,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { PedidoService } from 'src/app/services/pedido.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PedidosPage implements OnInit {

  pedidos: any[] = [];
  loading = true;

  searchTerm = '';
  filtroEstado = 'ALL';

  // detalle variables
  detalleSeleccionado: any[] = [];
  pedidoSeleccionado: any = null;
  loadingDetalle = false;
  totalDetalle = 0;

  constructor(private pedidoService: PedidoService,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.loading = true;

    this.pedidoService.listarPedidos().subscribe({
      next: (data) => {
        this.pedidos = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pedidos', err);
        this.loading = false;
      }
    });
  }

  // 🔥 PERFORMANCE
  trackByPedido(index: number, item: any) {
    return item.idpedido;
  }

  // 🎯 FILTROS + SEARCH
  pedidosFiltrados() {
    let lista = [...this.pedidos];

    if (this.filtroEstado !== 'ALL') {
      lista = lista.filter(p => p.status === this.filtroEstado);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      lista = lista.filter(p =>
        String(p.idpedido).includes(term) ||
        (p.clienteNombre || '').toLowerCase().includes(term)
      );
    }

    return lista;
  }

  getColor(status: string) {
    switch (status) {
      case 'PAGADO': return 'success';
      case 'PENDIENTE': return 'warning';
      case 'CANCELADO': return 'danger';
      default: return 'medium';
    }
  }

  getMetodoPago(tipo: number): string {
    switch (tipo) {
      case 1: return 'PayPal';
      case 2: return 'QR';
      default: return 'Otro';
    }
  }

  verDetalle(pedido: any) {
    console.log('CLICK:', pedido);

    this.pedidoSeleccionado = pedido;
    this.loadingDetalle = true;
    this.detalleSeleccionado = [];
    this.totalDetalle = 0;

    this.cd.detectChanges(); // 🔥 fuerza render inmediato

    this.pedidoService.getDetallePedido(pedido.idpedido).subscribe({
      next: (data) => {
        console.log('DETALLE:', data);

        this.detalleSeleccionado = data || [];

        this.totalDetalle = this.detalleSeleccionado.reduce(
          (acc, item) => acc + (item.subtotal || 0),
          0
        );

        this.loadingDetalle = false;

        this.cd.detectChanges(); // 🔥 CLAVE (sin esto se queda cargando)
      },
      error: (err) => {
        console.error(err);

        this.loadingDetalle = false;
        this.cd.detectChanges(); // 🔥 también aquí
      }
    });
  }
  cambiarEstado(pedido: any) {
    console.log('Cambiar estado', pedido);

    // 🔜 abrir modal:
    // Pendiente → Pagado → Cancelado
  }
}