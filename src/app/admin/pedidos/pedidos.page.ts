import {
  Component,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { PedidoService } from 'src/app/services/pedido.service';
import { ChangeDetectorRef } from '@angular/core';
import { AlertController } from '@ionic/angular';

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
    private cd: ChangeDetectorRef,
    private alertCtrl: AlertController) { }

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.loading = true;
    this.cd.markForCheck(); // 👈 importante

    this.pedidoService.listarPedidos().subscribe({
      next: (data) => {
        console.log('DATA:', data);

        this.pedidos = data || [];
        this.loading = false;

        this.cd.markForCheck(); // 🔥 CLAVE
      },
      error: (err) => {
        console.error('Error cargando pedidos', err);

        this.loading = false;
        this.cd.markForCheck(); // 🔥 también aquí
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

    // 🔥 si el seleccionado ya no está → cerrar
    if (
      this.pedidoSeleccionado &&
      !lista.find(p => p.idpedido === this.pedidoSeleccionado.idpedido)
    ) {
      this.cerrarDetalle();
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

    // 🔥 si ya está abierto el mismo → cerrar
    if (this.pedidoSeleccionado?.idpedido === pedido.idpedido) {
      this.cerrarDetalle();
      return;
    }

    this.pedidoSeleccionado = pedido;
    this.loadingDetalle = true;
    this.detalleSeleccionado = [];
    this.totalDetalle = 0;

    this.cd.detectChanges();

    this.pedidoService.getDetallePedido(pedido.idpedido).subscribe({
      next: (data) => {
        this.detalleSeleccionado = data || [];

        this.totalDetalle = this.detalleSeleccionado.reduce(
          (acc, item) => acc + (item.subtotal || 0),
          0
        );

        this.loadingDetalle = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loadingDetalle = false;
        this.cd.detectChanges();
      }
    });
  }

  async cambiarEstado(pedido: any) {

    const alert = await this.alertCtrl.create({
      header: 'Cambiar estado',
      subHeader: `Pedido #${pedido.idpedido}`,

      inputs: [
        {
          type: 'radio',
          label: 'PENDIENTE',
          value: 'PENDIENTE',
          checked: pedido.status === 'PENDIENTE'
        },
        {
          type: 'radio',
          label: 'PAGADO',
          value: 'PAGADO',
          checked: pedido.status === 'PAGADO'
        },
        {
          type: 'radio',
          label: 'CANCELADO',
          value: 'CANCELADO',
          checked: pedido.status === 'CANCELADO'
        }
      ],

      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (nuevoEstado) => {
            this.actualizarEstado(pedido, nuevoEstado);
          }
        }
      ]
    });

    await alert.present();
  }

  cerrarDetalle() {
    this.pedidoSeleccionado = null;
    this.detalleSeleccionado = [];
    this.totalDetalle = 0;
    this.loadingDetalle = false;

    this.cd.detectChanges();
  }
  actualizarEstado(pedido: any, nuevoEstado: string) {

    const payload = {
      ...pedido,
      status: nuevoEstado
    };

    console.log('UPDATE PAYLOAD:', payload);

    this.pedidoService.updatePedido(payload).subscribe({
      next: () => {
        console.log('Estado actualizado');

        // 🔥 actualiza UI sin recargar backend
        pedido.status = nuevoEstado;
        this.cargarPedidos();

      },
      error: (err) => {
        console.error('Error actualizando estado', err);
      }
    });
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'PAGADO': return 'checkmark-circle';
      case 'PENDIENTE': return 'time';
      case 'CANCELADO': return 'close-circle';
      default: return 'help-circle';
    }
  }
}