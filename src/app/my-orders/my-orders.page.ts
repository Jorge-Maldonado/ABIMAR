import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { PedidoService } from '../services/pedido.service';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.page.html',
  styleUrls: ['./my-orders.page.scss'],
})
export class MyOrdersPage implements OnInit {

  pedidos: any[] = [];
  loading = true;
  filtroEstado = 'ALL';
  personalId = Number(localStorage.getItem('personal') || 0);

  pedidoAbiertoId: number | null = null;
  detalle: any[] = [];
  loadingDetalle = false;
  totalDetalle = 0;

  constructor(
    private pedidoService: PedidoService,
    private router: Router,
    private menu: MenuController,
    private util: UtilService
  ) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  ionViewWillEnter() {
    this.util.setMenuState(true);
    this.menu.enable(true, 'mainMenu');
    this.personalId = Number(localStorage.getItem('personal') || 0);
    this.cargarPedidos();
  }

  get countAll(): number {
    return this.pedidos.length;
  }

  get countPendiente(): number {
    return this.pedidos.filter(p => p.status === 'PENDIENTE').length;
  }

  get countPagado(): number {
    return this.pedidos.filter(p => p.status === 'PAGADO').length;
  }

  get countCancelado(): number {
    return this.pedidos.filter(p => p.status === 'CANCELADO').length;
  }

  pedidosFiltrados(): any[] {
    if (this.filtroEstado === 'ALL') {
      return this.pedidos;
    }
    return this.pedidos.filter(p => p.status === this.filtroEstado);
  }

  trackByPedido(_i: number, item: any) {
    return item.idpedido;
  }

  cargarPedidos(event?: any) {
    if (!event) {
      this.loading = true;
    }

    if (!this.personalId) {
      this.pedidos = [];
      this.loading = false;
      if (event) {
        event.target.complete();
      }
      return;
    }

    this.pedidoService.getPedidosByPersonal(this.personalId).subscribe({
      next: (resp) => {
        const lista = Array.isArray(resp) ? resp : [];
        this.pedidos = lista.sort((a, b) => {
          const fa = new Date(a.fecha || 0).getTime();
          const fb = new Date(b.fecha || 0).getTime();
          return fb - fa;
        });
        this.loading = false;
        if (event) {
          event.target.complete();
        }
      },
      error: (err) => {
        console.error(err);
        this.pedidos = [];
        this.loading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  getEstadoClase(status: string) {
    switch (status) {
      case 'PAGADO': return 'badge-success';
      case 'PENDIENTE': return 'badge-warning';
      case 'CANCELADO': return 'badge-danger';
      default: return 'badge-muted';
    }
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'PAGADO': return 'checkmark-circle';
      case 'PENDIENTE': return 'time';
      case 'CANCELADO': return 'close-circle';
      default: return 'help-circle';
    }
  }

  getMetodoPago(tipo: number): string {
    switch (Number(tipo)) {
      case 1: return 'PayPal';
      case 2: return 'QR';
      default: return 'Por definir';
    }
  }

  getMetodoIcon(tipo: number): string {
    switch (Number(tipo)) {
      case 1: return 'logo-paypal';
      case 2: return 'qr-code-outline';
      default: return 'card-outline';
    }
  }

  isOpen(order: any): boolean {
    return this.pedidoAbiertoId === order?.idpedido;
  }

  toggleDetalle(order: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    if (this.pedidoAbiertoId === order.idpedido) {
      this.cerrarDetalle();
      return;
    }

    this.pedidoAbiertoId = order.idpedido;
    this.loadingDetalle = true;
    this.detalle = [];
    this.totalDetalle = 0;

    this.pedidoService.getDetallePedido(order.idpedido).subscribe({
      next: (data) => {
        this.detalle = data || [];
        this.totalDetalle = this.detalle.reduce(
          (acc, item) => acc + (Number(item.subtotal) || 0),
          0
        );
        this.loadingDetalle = false;
      },
      error: (err) => {
        console.error(err);
        this.detalle = [];
        this.loadingDetalle = false;
      }
    });
  }

  cerrarDetalle() {
    this.pedidoAbiertoId = null;
    this.detalle = [];
    this.totalDetalle = 0;
    this.loadingDetalle = false;
  }

  continuarPago(order: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (order.status !== 'PENDIENTE') {
      return;
    }

    const total = Number(order.monto) || 0;
    localStorage.setItem('pedidoId', String(order.idpedido));
    localStorage.setItem('totalPedido', total.toFixed(2));

    this.router.navigate(['/payment-methods'], {
      queryParams: {
        pedidoId: order.idpedido,
        total: total.toFixed(2)
      }
    });
  }

  irAComprar() {
    this.router.navigate(['/home']);
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}
