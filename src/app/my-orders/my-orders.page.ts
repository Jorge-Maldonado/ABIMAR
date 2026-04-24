import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PedidoService } from '../services/pedido.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.page.html',
  styleUrls: ['./my-orders.page.scss'],
})
export class MyOrdersPage implements OnInit {

  pedidos: any[] = [];
  personalId: number = parseInt(localStorage.getItem('personal') || '0');

  constructor(
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.pedidoService.getPedidosByPersonal(this.personalId).subscribe({
      next: (resp) => {
        this.pedidos = resp || [];
      },
      error: (err) => {
        console.error(err);
        this.pedidos = [];
      }
    });
  }

  abrirPedido(order: any) {

    console.log('CLICK PEDIDO:', order);

    // 🔥 SOLO SI ESTÁ PENDIENTE
    if (order.status === 'PENDIENTE') {

      this.router.navigate(['/qr-payment'], {
        queryParams: {
          pedidoId: order.idpedido,
          total: order.monto
        }
      });

    } else {

      console.log('Pedido no editable, estado:', order.status);
      // aquí luego puedes abrir detalle o solo ver resumen
    }
  }

  getEstadoClase(status: string) {
    switch (status) {
      case 'PAGADO': return 'badge-success';
      case 'PENDIENTE': return 'badge-warning';
      case 'CANCELADO': return 'badge-danger';
      default: return '';
    }
  }
}