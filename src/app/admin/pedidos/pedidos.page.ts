import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { PedidoService } from 'src/app/services/pedido.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosPage implements OnInit {

  pedidos: any[] = [];
  loading = true;

  searchTerm = '';
  filtroEstado: 'ALL' | 'PENDIENTE' | 'PAGADO' | 'ENTREGADO' | 'CANCELADO' = 'ALL';
  filtroPago: 'ALL' | 1 | 2 | 0 = 'ALL';

  detalleSeleccionado: any[] = [];
  pedidoSeleccionado: any = null;
  loadingDetalle = false;
  totalDetalle = 0;
  savingEstado = false;

  private personasMap = new Map<number, { nombre: string; telefono?: string; email?: string }>();
  private productosMap = new Map<number, { nombre: string; imagen: string }>();

  constructor(
    private pedidoService: PedidoService,
    private apiService: ApiService<any>,
    private cd: ChangeDetectorRef,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarCatalogos();
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

  get countEntregado(): number {
    return this.pedidos.filter(p => p.status === 'ENTREGADO').length;
  }

  get countCancelado(): number {
    return this.pedidos.filter(p => p.status === 'CANCELADO').length;
  }

  get ingresosPagados(): number {
    return this.pedidos
      .filter(p => p.status === 'PAGADO' || p.status === 'ENTREGADO')
      .reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
  }

  private cargarCatalogos() {
    const personas$ = this.apiService
      .post(this.apiService.url('persona/list'), {})
      .pipe(
        map((res: any) => (Array.isArray(res) ? res : [])),
        catchError(() => of([]))
      );

    const productos$ = this.apiService
      .post(this.apiService.url('producto/list'), {})
      .pipe(
        map((res: any) => (Array.isArray(res) ? res : [])),
        catchError(() => of([]))
      );

    forkJoin([personas$, productos$]).subscribe(([personas, productos]) => {
      this.personasMap.clear();
      (personas as any[]).forEach((p) => {
        const id = Number(p.idpersona || p.id);
        if (!id) return;
        const nombre = [p.nombres, p.apellidos].filter(Boolean).join(' ').trim()
          || p.razonSocial
          || `Persona #${id}`;
        this.personasMap.set(id, {
          nombre,
          telefono: p.telefono ? String(p.telefono) : undefined,
        });
      });

      this.productosMap.clear();
      (productos as any[]).forEach((p) => {
        const id = Number(p.idproducto || p.id);
        if (!id) return;
        this.productosMap.set(id, {
          nombre: p.nombre || `Producto #${id}`,
          imagen: this.normalizeImagePath(p.imagen),
        });
      });

      if (this.pedidos.length) {
        this.pedidos = this.enriquecerPedidos(this.pedidos);
      }
      if (this.detalleSeleccionado.length) {
        this.detalleSeleccionado = this.enriquecerDetalle(this.detalleSeleccionado);
      }
      this.cd.markForCheck();
    });
  }

  cargarPedidos(event?: any) {
    if (!event) {
      this.loading = true;
      this.cd.markForCheck();
    }

    this.pedidoService.listarPedidos().subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : [];
        this.pedidos = this.enriquecerPedidos(
          lista.sort((a, b) => {
            const fa = new Date(a.fecha || 0).getTime();
            const fb = new Date(b.fecha || 0).getTime();
            return fb - fa;
          })
        );
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
      error: async () => {
        this.pedidos = [];
        this.loading = false;
        if (event) {
          event.target.complete();
        }
        this.cd.markForCheck();
        await this.showToast('No se pudieron cargar los pedidos', 'danger');
      },
    });
  }

  private enriquecerPedidos(lista: any[]): any[] {
    return lista.map((p) => {
      const personalId = Number(p.personal || p.personaId || 0);
      const persona = this.personasMap.get(personalId);
      return {
        ...p,
        personal: personalId || p.personal,
        clienteNombre:
          p.clienteNombre ||
          persona?.nombre ||
          (personalId ? `Cliente #${personalId}` : ''),
        clienteTelefono: persona?.telefono || '',
      };
    });
  }

  private enriquecerDetalle(lines: any[]): any[] {
    return lines.map((d) => {
      const productoId = Number(d.productoId || d.idproducto || 0);
      const cached = this.productosMap.get(productoId);
      const rawImg = d.productoImagen || d.imagen || cached?.imagen || '';
      return {
        ...d,
        productoId,
        productoNombre:
          d.productoNombre || cached?.nombre || `Producto #${productoId || '—'}`,
        imagen: this.normalizeImagePath(rawImg || cached?.imagen),
      };
    });
  }

  trackByPedido(_index: number, item: any) {
    return item.idpedido;
  }

  trackByDetalle(_index: number, item: any) {
    return item.iddetallepedido || item.productoId || _index;
  }

  setFiltroEstado(estado: 'ALL' | 'PENDIENTE' | 'PAGADO' | 'ENTREGADO' | 'CANCELADO') {
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
        String(p.personal || '').includes(term) ||
        (p.clienteNombre || '').toLowerCase().includes(term) ||
        (p.referenciaCobro || '').toLowerCase().includes(term) ||
        this.codigoPedido(p).toLowerCase().includes(term) ||
        (p.direccionEnvio || '').toLowerCase().includes(term) ||
        this.getMetodoPago(p.tipoPagoId).toLowerCase().includes(term) ||
        this.responsableEntrega(p).toLowerCase().includes(term) ||
        this.notaEntrega(p).toLowerCase().includes(term)
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
      case 'ENTREGADO': return 'bicycle-outline';
      case 'PENDIENTE': return 'time';
      case 'CANCELADO': return 'close-circle';
      default: return 'help-circle';
    }
  }

  /** Nombre de quien entregó (persistido en datosPaypal.entrega). */
  responsableEntrega(pedido: any): string {
    return this.getEntregaMeta(pedido)?.responsable || '';
  }

  notaEntrega(pedido: any): string {
    return this.getEntregaMeta(pedido)?.nota || '';
  }

  private getEntregaMeta(pedido: any): { responsable?: string; nota?: string; fecha?: string } | null {
    const raw = String(pedido?.datosPaypal || '').trim();
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.entrega && typeof parsed.entrega === 'object') {
        return parsed.entrega;
      }
    } catch {
      return null;
    }
    return null;
  }

  private buildDatosConEntrega(pedido: any, responsable: string, nota: string): string {
    let base: any = {};
    const raw = String(pedido?.datosPaypal || '').trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          base = { ...parsed };
        } else {
          base = { paypalRaw: raw };
        }
      } catch {
        base = { paypalRaw: raw };
      }
    }

    base.entrega = {
      responsable: responsable.trim(),
      nota: (nota || '').trim(),
      fecha: new Date().toISOString(),
    };
    return JSON.stringify(base);
  }

  isSelected(pedido: any): boolean {
    return this.pedidoSeleccionado?.idpedido === pedido?.idpedido;
  }

  nombreCliente(pedido: any): string {
    return pedido?.clienteNombre || (pedido?.personal ? `Cliente #${pedido.personal}` : 'Cliente no identificado');
  }

  codigoPedido(pedido: any): string {
    return this.pedidoService.codigoPublico(pedido);
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
        this.detalleSeleccionado = this.enriquecerDetalle(data || []);
        this.totalDetalle = this.detalleSeleccionado.reduce(
          (acc, item) => acc + (Number(item.subtotal) || 0),
          0
        );
        this.loadingDetalle = false;
        this.cd.markForCheck();
      },
      error: async () => {
        this.loadingDetalle = false;
        this.cd.markForCheck();
        await this.showToast('No se pudo cargar el detalle', 'danger');
      },
    });
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('no-image.png')) {
      img.src = 'assets/no-image.png';
    }
  }

  async cambiarEstado(pedido: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const puedeEntregar = pedido.status === 'PAGADO' || pedido.status === 'ENTREGADO';

    const inputs: any[] = [
      {
        type: 'radio',
        label: 'PENDIENTE',
        value: 'PENDIENTE',
        checked: pedido.status === 'PENDIENTE',
      },
      {
        type: 'radio',
        label: 'PAGADO',
        value: 'PAGADO',
        checked: pedido.status === 'PAGADO',
      },
    ];

    if (puedeEntregar) {
      inputs.push({
        type: 'radio',
        label: 'ENTREGADO (solo desde PAGADO)',
        value: 'ENTREGADO',
        checked: pedido.status === 'ENTREGADO',
      });
    }

    inputs.push({
      type: 'radio',
      label: 'CANCELADO',
      value: 'CANCELADO',
      checked: pedido.status === 'CANCELADO',
    });

    const alert = await this.alertCtrl.create({
      header: 'Cambiar estado',
      subHeader: `${this.codigoPedido(pedido)} · actual: ${pedido.status}`,
      message: puedeEntregar
        ? undefined
        : 'Para marcar ENTREGADO el pedido debe estar PAGADO.',
      inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Continuar',
          handler: (nuevoEstado) => {
            if (!nuevoEstado || nuevoEstado === pedido.status) {
              return;
            }

            if (nuevoEstado === 'ENTREGADO' && pedido.status !== 'PAGADO') {
              this.showToast('Solo puedes entregar un pedido que esté PAGADO', 'warning');
              return false;
            }

            const sinMetodo = !pedido.tipoPagoId || Number(pedido.tipoPagoId) === 0;
            if (nuevoEstado === 'PAGADO' && sinMetodo) {
              setTimeout(() => this.pedirMetodoPagoYActualizar(pedido, nuevoEstado), 0);
            } else if (nuevoEstado === 'ENTREGADO') {
              setTimeout(() => this.pedirResponsableEntrega(pedido), 0);
            } else {
              this.actualizarEstado(pedido, nuevoEstado);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private async pedirMetodoPagoYActualizar(pedido: any, nuevoEstado: string) {
    const alert = await this.alertCtrl.create({
      header: 'Método de pago',
      message: 'Este pedido no tenía método definido. ¿Cómo pagó el cliente?',
      inputs: [
        { type: 'radio', label: 'QR', value: '2', checked: true },
        { type: 'radio', label: 'PayPal', value: '1' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (tipo) => {
            this.actualizarEstado(pedido, nuevoEstado, { tipoPagoId: Number(tipo) || 2 });
          },
        },
      ],
    });
    await alert.present();
  }

  private async pedirResponsableEntrega(pedido: any) {
    if (pedido.status !== 'PAGADO') {
      await this.showToast('Solo puedes entregar un pedido que esté PAGADO', 'warning');
      return;
    }

    const prev = this.getEntregaMeta(pedido);
    const sugerido =
      (prev?.responsable || '').trim() ||
      (localStorage.getItem('adminUsuario') || '').trim() ||
      '';

    const alert = await this.alertCtrl.create({
      header: 'Entrega del pedido',
      subHeader: this.codigoPedido(pedido),
      message: 'Indica quién entregó el pedido (obligatorio).',
      inputs: [
        {
          name: 'responsable',
          type: 'text',
          placeholder: 'Nombre del responsable',
          value: sugerido,
          attributes: { maxlength: 80 },
        },
        {
          name: 'nota',
          type: 'textarea',
          placeholder: 'Descripción u observación (opcional)',
          value: prev?.nota || '',
          attributes: { maxlength: 240 },
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Marcar entregado',
          handler: (data) => {
            const responsable = String(data?.responsable || '').trim();
            if (!responsable) {
              this.showToast('El nombre del responsable es obligatorio', 'warning');
              return false;
            }
            const nota = String(data?.nota || '').trim();
            this.actualizarEstado(pedido, 'ENTREGADO', { responsable, nota });
            return true;
          },
        },
      ],
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

  actualizarEstado(
    pedido: any,
    nuevoEstado: string,
    opts?: { tipoPagoId?: number; responsable?: string; nota?: string }
  ) {
    if (this.savingEstado) {
      return;
    }

    if (nuevoEstado === 'ENTREGADO' && pedido.status !== 'PAGADO') {
      this.showToast('Solo puedes entregar un pedido que esté PAGADO', 'warning');
      return;
    }

    this.savingEstado = true;
    this.cd.markForCheck();

    // No enviar campos enriquecidos solo de UI
    const {
      clienteNombre,
      clienteTelefono,
      clienteEmail,
      ...pedidoLimpio
    } = pedido;

    const payload: any = {
      ...pedidoLimpio,
      status: nuevoEstado,
    };

    const tipoPagoId = opts?.tipoPagoId;
    if (tipoPagoId === 1 || tipoPagoId === 2) {
      payload.tipoPagoId = tipoPagoId;
    }

    if (nuevoEstado === 'ENTREGADO' && opts?.responsable) {
      payload.datosPaypal = this.buildDatosConEntrega(
        pedido,
        opts.responsable,
        opts.nota || ''
      );
    }

    this.pedidoService.updatePedido(payload).subscribe({
      next: async () => {
        pedido.status = nuevoEstado;
        if (tipoPagoId === 1 || tipoPagoId === 2) {
          pedido.tipoPagoId = tipoPagoId;
        }
        if (payload.datosPaypal) {
          pedido.datosPaypal = payload.datosPaypal;
        }
        if (this.pedidoSeleccionado?.idpedido === pedido.idpedido) {
          this.pedidoSeleccionado = {
            ...pedido,
            clienteNombre: clienteNombre || this.nombreCliente(pedido),
          };
        }
        this.savingEstado = false;
        this.cd.markForCheck();
        const metodo = tipoPagoId ? ` · ${this.getMetodoPago(tipoPagoId)}` : '';
        const quien = opts?.responsable ? ` · ${opts.responsable}` : '';
        await this.showToast(`${this.codigoPedido(pedido)} → ${nuevoEstado}${metodo}${quien}`, 'success');
        this.cargarPedidos();
      },
      error: async () => {
        this.savingEstado = false;
        this.cd.markForCheck();
        await this.showToast('No se pudo actualizar el estado', 'danger');
      },
    });
  }

  private normalizeImagePath(val: any): string {
    if (!val) return 'assets/no-image.png';
    const s = String(val).trim();
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith('assets/')) return s;
    if (s.startsWith('/assets/')) return s.substring(1);
    const onlyName = s.replace(/^.*[\\/]/, '');
    return `assets/products/${onlyName}`;
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      color,
      position: 'bottom',
      cssClass: 'custom-toast',
    });
    await toast.present();
  }
}
