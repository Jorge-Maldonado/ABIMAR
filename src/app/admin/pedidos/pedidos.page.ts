import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { PedidoService } from 'src/app/services/pedido.service';

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
  filtroEstado: 'ALL' | 'PENDIENTE' | 'PAGADO' | 'CANCELADO' = 'ALL';
  filtroPago: 'ALL' | 1 | 2 | 0 = 'ALL';

  detalleSeleccionado: any[] = [];
  pedidoSeleccionado: any = null;
  loadingDetalle = false;
  totalDetalle = 0;
  savingEstado = false;

  constructor(
    private pedidoService: PedidoService,
    private cd: ChangeDetectorRef,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
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

  get ingresosPagados(): number {
    return this.pedidos
      .filter(p => p.status === 'PAGADO')
      .reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
  }

  cargarPedidos(event?: any) {
    if (!event) {
      this.loading = true;
      this.cd.markForCheck();
    }

    this.pedidoService.listarPedidos().subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : [];
        this.pedidos = lista.sort((a, b) => {
          const fa = new Date(a.fecha || 0).getTime();
          const fb = new Date(b.fecha || 0).getTime();
          return fb - fa;
        });
        this.loading = false;
        if (event) {
          event.target.complete();
        }

        if (this.pedidoSeleccionado) {
          const updated = this.pedidos.find(
            p => p.idpedido === this.pedidoSeleccionado.idpedido
          );
          if (updated) {
            this.pedidoSeleccionado = { ...updated };
          } else {
            this.cerrarDetalle();
          }
        }

        this.cd.markForCheck();
      },
      error: async (err) => {
        console.error('Error cargando pedidos', err);
        this.pedidos = [];
        this.loading = false;
        if (event) {
          event.target.complete();
        }
        this.cd.markForCheck();
        await this.showToast('No se pudieron cargar los pedidos', 'danger');
      }
    });
  }

  trackByPedido(_index: number, item: any) {
    return item.idpedido;
  }

  setFiltroEstado(estado: 'ALL' | 'PENDIENTE' | 'PAGADO' | 'CANCELADO') {
    this.filtroEstado = estado;
    this.cd.markForCheck();
  }

  setFiltroPago(pago: 'ALL' | 1 | 2 | 0) {
    this.filtroPago = pago;
    this.cd.markForCheck();
  }

  onSearchChange() {
    this.cd.markForCheck();
  }

  pedidosFiltrados() {
    let lista = [...this.pedidos];

    if (this.filtroEstado !== 'ALL') {
      lista = lista.filter(p => p.status === this.filtroEstado);
    }

    if (this.filtroPago !== 'ALL') {
      if (this.filtroPago === 0) {
        lista = lista.filter(p => {
          const t = Number(p.tipoPagoId);
          return !p.tipoPagoId || t === 0 || (t !== 1 && t !== 2);
        });
      } else {
        lista = lista.filter(p => Number(p.tipoPagoId) === Number(this.filtroPago));
      }
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      lista = lista.filter(p =>
        String(p.idpedido).includes(term) ||
        (p.clienteNombre || '').toLowerCase().includes(term) ||
        (p.direccionEnvio || '').toLowerCase().includes(term) ||
        this.getMetodoPago(p.tipoPagoId).toLowerCase().includes(term)
      );
    }

    return lista;
  }

  getMetodoPago(tipo: number): string {
    switch (Number(tipo)) {
      case 1: return 'PayPal';
      case 2: return 'QR';
      default: return 'Sin definir';
    }
  }

  getMetodoIcon(tipo: number): string {
    switch (Number(tipo)) {
      case 1: return 'logo-paypal';
      case 2: return 'qr-code-outline';
      default: return 'card-outline';
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

  isSelected(pedido: any): boolean {
    return this.pedidoSeleccionado?.idpedido === pedido?.idpedido;
  }

  verDetalle(pedido: any) {
    if (this.pedidoSeleccionado?.idpedido === pedido.idpedido) {
      this.cerrarDetalle();
      return;
    }

    this.pedidoSeleccionado = pedido;
    this.loadingDetalle = true;
    this.detalleSeleccionado = [];
    this.totalDetalle = 0;
    this.cd.markForCheck();

    this.pedidoService.getDetallePedido(pedido.idpedido).subscribe({
      next: (data) => {
        this.detalleSeleccionado = data || [];
        this.totalDetalle = this.detalleSeleccionado.reduce(
          (acc, item) => acc + (Number(item.subtotal) || 0),
          0
        );
        this.loadingDetalle = false;
        this.cd.markForCheck();
      },
      error: async (err) => {
        console.error(err);
        this.loadingDetalle = false;
        this.cd.markForCheck();
        await this.showToast('No se pudo cargar el detalle', 'danger');
      }
    });
  }

  async cambiarEstado(pedido: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

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
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (nuevoEstado) => {
            if (nuevoEstado && nuevoEstado !== pedido.status) {
              this.actualizarEstado(pedido, nuevoEstado);
            }
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
    this.cd.markForCheck();
  }

  actualizarEstado(pedido: any, nuevoEstado: string) {
    if (this.savingEstado) {
      return;
    }

    this.savingEstado = true;
    this.cd.markForCheck();

    const payload = {
      ...pedido,
      status: nuevoEstado
    };

    this.pedidoService.updatePedido(payload).subscribe({
      next: async () => {
        pedido.status = nuevoEstado;
        if (this.pedidoSeleccionado?.idpedido === pedido.idpedido) {
          this.pedidoSeleccionado = { ...pedido };
        }
        this.savingEstado = false;
        this.cd.markForCheck();
        await this.showToast(`Pedido #${pedido.idpedido} → ${nuevoEstado}`, 'success');
        this.cargarPedidos();
      },
      error: async (err) => {
        console.error('Error actualizando estado', err);
        this.savingEstado = false;
        this.cd.markForCheck();
        await this.showToast('No se pudo actualizar el estado', 'danger');
      }
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      color,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}
