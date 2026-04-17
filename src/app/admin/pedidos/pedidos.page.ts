import { Component, OnInit } from '@angular/core';
import { PedidoService } from 'src/app/services/pedido.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {

  pedidos: any[] = [];
  loading = true;

  constructor(private pedidoService: PedidoService) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.pedidoService.listarPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pedidos', err);
        this.loading = false;
      }
    });
  }
  getColor(status: string) {
  switch (status) {
    case 'PAGADO': return 'success';
    case 'PENDIENTE': return 'warning';
    case 'CANCELADO': return 'danger';
    default: return 'medium';
  }
}
}