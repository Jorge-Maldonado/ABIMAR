import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, ToastController } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
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

  /** Cache productoId → { nombre, imagen } */
  private productosMap = new Map<number, { nombre: string; imagen: string }>();
  private productosCargados = false;

  readonly whatsappNumber = '59173283217';
  readonly whatsappDisplay = '+591 73283217';

  constructor(
    private pedidoService: PedidoService,
    private apiService: ApiService<any>,
    private router: Router,
    private menu: MenuController,
    private util: UtilService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarCatalogoProductos();
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

  trackByDetalle(_i: number, item: any) {
    return item.iddetallepedido || item.productoId || _i;
  }

  setFiltro(estado: string) {
    this.filtroEstado = estado;
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
      error: async (err) => {
        console.error(err);
        this.pedidos = [];
        this.loading = false;
        if (event) {
          event.target.complete();
        }
        await this.mostrarToast('No se pudieron cargar tus pedidos', 'danger');
      }
    });
  }

  private cargarCatalogoProductos() {
    this.apiService
      .post(this.apiService.url('producto/list'), {})
      .pipe(
        map((res: any) => (Array.isArray(res) ? res : [])),
        catchError(() => of([]))
      )
      .subscribe((lista: any[]) => {
        this.productosMap.clear();
        lista.forEach((p) => {
          const id = Number(p.idproducto || p.id);
          if (!id) return;
          this.productosMap.set(id, {
            nombre: p.nombre || `Producto #${id}`,
            imagen: this.normalizeImagePath(p.imagen),
          });
        });
        this.productosCargados = true;

        // Re-enriquecer detalle abierto si ya estaba cargado
        if (this.detalle.length > 0) {
          this.detalle = this.enriquecerDetalle(this.detalle);
        }
      });
  }

  getEstadoClase(status: string) {
    switch (status) {
      case 'PAGADO': return 'badge-success';
      case 'ENTREGADO': return 'badge-accent';
      case 'PENDIENTE': return 'badge-warning';
      case 'CANCELADO': return 'badge-danger';
      default: return 'badge-muted';
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

    const detalle$ = this.pedidoService.getDetallePedido(order.idpedido);
    const catalogo$ = this.productosCargados
      ? of(null)
      : this.apiService.post(this.apiService.url('producto/list'), {}).pipe(
          map((res: any) => (Array.isArray(res) ? res : [])),
          catchError(() => of([]))
        );

    forkJoin([detalle$, catalogo$]).subscribe({
      next: ([data, catalogo]) => {
        if (Array.isArray(catalogo)) {
          catalogo.forEach((p: any) => {
            const id = Number(p.idproducto || p.id);
            if (!id) return;
            this.productosMap.set(id, {
              nombre: p.nombre || `Producto #${id}`,
              imagen: this.normalizeImagePath(p.imagen),
            });
          });
          this.productosCargados = true;
        }

        const lines = Array.isArray(data) ? data : [];
        this.detalle = this.enriquecerDetalle(lines);
        this.totalDetalle = this.detalle.reduce(
          (acc, item) => acc + (Number(item.subtotal) || 0),
          0
        );
        this.loadingDetalle = false;
      },
      error: async (err) => {
        console.error(err);
        this.detalle = [];
        this.loadingDetalle = false;
        await this.mostrarToast('No se pudo cargar el detalle', 'danger');
      }
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
        productoNombre: d.productoNombre || cached?.nombre || `Producto #${productoId || '—'}`,
        imagen: this.normalizeImagePath(rawImg || cached?.imagen),
      };
    });
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('no-image.png')) {
      img.src = 'assets/no-image.png';
    }
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

  codigoPedido(order: any): string {
    return this.pedidoService.codigoPublico(order);
  }

  abrirWhatsAppEntrega(order: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const codigo = this.codigoPedido(order);
    const msg = [
      'Hola Abimar Shop,',
      `consulto por mi pedido ${codigo}`,
      `por Bs. ${Number(order.monto || 0).toFixed(2)}.`,
      'Quedo atento/a para coordinar la entrega.',
    ].join(' ');

    const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.href = url;
    }
  }

  irAComprar() {
    this.router.navigate(['/home']);
  }

  irALogin() {
    this.router.navigate(['/login']);
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

  private async mostrarToast(message: string, color: string) {
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
