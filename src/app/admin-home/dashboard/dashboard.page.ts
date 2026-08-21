import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { PedidoService } from '../../services/pedido.service';

export interface DashboardSummary {
  pedidos: {
    total: number;
    pendientes: number;
    pagados: number;
    entregados: number;
    cancelados: number;
  };
  ingresos: {
    ingresosPagadosBs: number;
    ticketPromedioBs: number;
  };
  catalogo: {
    productosTotal: number;
    productosActivos: number;
    stockBajo: number;
    categoriasTotal: number;
  };
  usuarios: {
    usuariosTotal: number;
    personasTotal: number;
  };
  pedidosRecientes: Array<{
    idpedido: number;
    codigo: string;
    monto: number;
    status: string;
    fecha: string;
    clienteNombre: string;
    tipoPagoId: number;
  }>;
  ventasPorDia: Array<{
    fecha: string;
    label: string;
    totalBs: number;
    cantidad: number;
  }>;
  topProductos: Array<{
    productoId: number;
    nombre: string;
    unidades: number;
    montoBs: number;
  }>;
  pagos: {
    paypal: number;
    qr: number;
    sinDefinir: number;
  };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  loading = true;
  usingMock = false;
  exporting = false;
  data: DashboardSummary | null = null;
  errorMsg = '';

  get maxVentaDia(): number {
    if (!this.data?.ventasPorDia?.length) return 1;
    return Math.max(...this.data.ventasPorDia.map(v => v.totalBs), 1);
  }

  get totalPagosMetodo(): number {
    if (!this.data) return 1;
    const p = this.data.pagos;
    return Math.max(p.paypal + p.qr + p.sinDefinir, 1);
  }

  constructor(
    private api: ApiService<any>,
    private pedidoService: PedidoService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarDashboard();
  }

  ionViewWillEnter() {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.loading = true;
    this.errorMsg = '';

    const asArray = (res: any): any[] => (Array.isArray(res) ? res : []);
    const safe = (obs: any): Observable<any[]> =>
      obs.pipe(
        map(asArray),
        catchError(() => of([] as any[]))
      );

    forkJoin({
      pedidos: safe(this.pedidoService.listarPedidos()),
      productos: safe(this.api.post(this.api.url('producto/list'), {})),
      categorias: safe(this.api.post(this.api.url('categoria/list'), {})),
      personas: safe(this.api.post(this.api.url('persona/list'), {})),
      usuarios: safe(this.api.post(this.api.url('usuario/list'), {})),
    }).subscribe({
      next: ({ pedidos, productos, categorias, personas, usuarios }) => {
        const personasMap = this.buildPersonasMap(personas);
        const productosMap = this.buildProductosMap(productos);
        const summary = this.buildSummary(
          pedidos,
          productos,
          categorias,
          personasMap,
          usuarios
        );
        this.data = summary;
        this.usingMock = false;
        this.loading = false;

        // Top productos: detalle de pedidos pagados recientes
        this.cargarTopProductos(pedidos, productosMap);
      },
      error: async () => {
        this.loading = false;
        this.data = null;
        this.errorMsg = 'No se pudieron cargar los datos del dashboard';
        await this.showToast(this.errorMsg, 'danger');
      },
    });
  }

  private buildPersonasMap(personas: any[]): Map<number, string> {
    const map = new Map<number, string>();
    personas.forEach((p) => {
      const id = Number(p.idpersona || p.id);
      if (!id) return;
      const nombre =
        [p.nombres, p.apellidos].filter(Boolean).join(' ').trim() ||
        p.razonSocial ||
        `Cliente #${id}`;
      map.set(id, nombre);
    });
    return map;
  }

  private buildProductosMap(productos: any[]): Map<number, string> {
    const map = new Map<number, string>();
    productos.forEach((p) => {
      const id = Number(p.idproducto || p.id);
      if (!id) return;
      map.set(id, p.nombre || `Producto #${id}`);
    });
    return map;
  }

  private buildSummary(
    pedidos: any[],
    productos: any[],
    categorias: any[],
    personasMap: Map<number, string>,
    usuarios: any[]
  ): DashboardSummary {
    const pendientes = pedidos.filter(p => p.status === 'PENDIENTE').length;
    const pagadosList = pedidos.filter(p => p.status === 'PAGADO');
    const entregados = pedidos.filter(p => p.status === 'ENTREGADO').length;
    const cancelados = pedidos.filter(p => p.status === 'CANCELADO').length;
    const cobradosList = pedidos.filter(
      p => p.status === 'PAGADO' || p.status === 'ENTREGADO'
    );
    const ingresosPagadosBs = cobradosList.reduce(
      (acc, p) => acc + (Number(p.monto) || 0),
      0
    );
    const ticketPromedioBs =
      cobradosList.length > 0 ? ingresosPagadosBs / cobradosList.length : 0;

    const productosActivos = productos.filter(p => Number(p.status) === 1).length;
    const stockBajo = productos.filter(p => {
      const s = Number(p.stock);
      return s > 0 && s <= 5;
    }).length;

    let paypal = 0;
    let qr = 0;
    let sinDefinir = 0;
    pedidos.forEach((p) => {
      const t = Number(p.tipoPagoId);
      if (t === 1) paypal += 1;
      else if (t === 2) qr += 1;
      else sinDefinir += 1;
    });

    const sorted = [...pedidos].sort((a, b) => {
      const fa = new Date(a.fecha || 0).getTime();
      const fb = new Date(b.fecha || 0).getTime();
      return fb - fa;
    });

    const pedidosRecientes = sorted.slice(0, 6).map((p) => {
      const personalId = Number(p.personal || 0);
      return {
        idpedido: p.idpedido,
        codigo: this.pedidoService.codigoPublico(p),
        monto: Number(p.monto) || 0,
        status: p.status || 'PENDIENTE',
        fecha: p.fecha,
        clienteNombre:
          p.clienteNombre ||
          personasMap.get(personalId) ||
          (personalId ? `Cliente #${personalId}` : 'Sin cliente'),
        tipoPagoId: Number(p.tipoPagoId) || 0,
      };
    });

    return {
      pedidos: {
        total: pedidos.length,
        pendientes,
        pagados: pagadosList.length,
        entregados,
        cancelados,
      },
      ingresos: {
        ingresosPagadosBs,
        ticketPromedioBs,
      },
      catalogo: {
        productosTotal: productos.length,
        productosActivos,
        stockBajo,
        categoriasTotal: categorias.length,
      },
      usuarios: {
        usuariosTotal: usuarios.length,
        personasTotal: personasMap.size,
      },
      pedidosRecientes,
      ventasPorDia: this.buildVentasPorDia(cobradosList),
      topProductos: [],
      pagos: { paypal, qr, sinDefinir },
    };
  }

  private buildVentasPorDia(pagados: any[]) {
    const days: Array<{ fecha: string; label: string; totalBs: number; cantidad: number }> = [];
    const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        fecha: this.dayKey(d),
        label: labels[d.getDay()],
        totalBs: 0,
        cantidad: 0,
      });
    }

    const index = new Map(days.map((d, i) => [d.fecha, i]));
    pagados.forEach((p) => {
      const f = new Date(p.fecha || 0);
      if (isNaN(f.getTime())) return;
      const idx = index.get(this.dayKey(f));
      if (idx == null) return;
      days[idx].totalBs += Number(p.monto) || 0;
      days[idx].cantidad += 1;
    });

    return days;
  }

  private dayKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private cargarTopProductos(pedidos: any[], productosMap: Map<number, string>) {
    const pagados = [...pedidos]
      .filter(p => p.status === 'PAGADO' || p.status === 'ENTREGADO')
      .sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime())
      .slice(0, 25);

    if (!pagados.length || !this.data) {
      return;
    }

    const calls = pagados.map((p) =>
      this.pedidoService.getDetallePedido(p.idpedido).pipe(
        catchError(() => of([]))
      )
    );

    forkJoin(calls).subscribe({
      next: (detallesList) => {
        const agg = new Map<number, { unidades: number; montoBs: number }>();
        detallesList.forEach((lines) => {
          (lines || []).forEach((d: any) => {
            const id = Number(d.productoId || d.idproducto || 0);
            if (!id) return;
            const cur = agg.get(id) || { unidades: 0, montoBs: 0 };
            cur.unidades += Number(d.cantidad) || 0;
            cur.montoBs += Number(d.subtotal) || 0;
            agg.set(id, cur);
          });
        });

        const top = [...agg.entries()]
          .map(([productoId, v]) => ({
            productoId,
            nombre: productosMap.get(productoId) || `Producto #${productoId}`,
            unidades: v.unidades,
            montoBs: v.montoBs,
          }))
          .sort((a, b) => b.unidades - a.unidades || b.montoBs - a.montoBs)
          .slice(0, 5);

        if (this.data) {
          this.data = { ...this.data, topProductos: top };
        }
      },
    });
  }

  getEstadoClase(status: string): string {
    switch (status) {
      case 'PAGADO': return 'st-ok';
      case 'ENTREGADO': return 'st-accent';
      case 'PENDIENTE': return 'st-warn';
      case 'CANCELADO': return 'st-bad';
      default: return 'st-muted';
    }
  }

  getMetodoPago(tipo: number): string {
    switch (Number(tipo)) {
      case 1: return 'PayPal';
      case 2: return 'QR';
      default: return 'N/D';
    }
  }

  pct(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  barHeight(value: number): number {
    return Math.max(8, Math.round((value / this.maxVentaDia) * 100));
  }

  formatBarValue(totalBs: number): string {
    if (totalBs >= 1000) {
      return (totalBs / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return String(Math.round(totalBs));
  }

  async descargarReporte() {
    if (!this.data || this.exporting) {
      return;
    }

    this.exporting = true;
    try {
      const stamp = this.stampFecha(new Date());
      const filename = `abimar-reporte-dashboard-${stamp}.html`;
      const html = this.buildReporteHtml(this.data, stamp);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      await this.showToast('Reporte descargado. Ábrelo e Imprimir → PDF si lo necesitas.', 'success');
    } catch (err) {
      console.error('Error generando reporte:', err);
      await this.showToast('No se pudo generar el reporte', 'danger');
    } finally {
      this.exporting = false;
    }
  }

  private stampFecha(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private formatBs(n: number): string {
    return 'Bs ' + (Number(n) || 0).toLocaleString('es', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private formatFechaHora(val: string): string {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm} ${hh}:${mi}`;
  }

  private escapeHtml(val: any): string {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private buildReporteHtml(data: DashboardSummary, stamp: string): string {
    const e = (v: any) => this.escapeHtml(v);
    const totalPagos = Math.max(
      data.pagos.paypal + data.pagos.qr + data.pagos.sinDefinir,
      1
    );
    const ventasRows = data.ventasPorDia.map((d) => `
      <tr>
        <td>${e(d.label)}</td>
        <td>${e(d.fecha)}</td>
        <td class="num">${e(this.formatBs(d.totalBs))}</td>
        <td class="num">${e(d.cantidad)}</td>
      </tr>`).join('');

    const topRows = data.topProductos.length
      ? data.topProductos.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${e(p.nombre)}</td>
        <td class="num">${e(p.unidades)}</td>
        <td class="num">${e(this.formatBs(p.montoBs))}</td>
      </tr>`).join('')
      : '<tr><td colspan="4">Aún no hay ventas pagadas para ranking.</td></tr>';

    const recentRows = data.pedidosRecientes.length
      ? data.pedidosRecientes.map((p) => `
      <tr>
        <td>${e(p.codigo)}</td>
        <td>${e(p.clienteNombre)}</td>
        <td>${e(this.formatFechaHora(p.fecha))}</td>
        <td>${e(this.getMetodoPago(p.tipoPagoId))}</td>
        <td>${e(p.status)}</td>
        <td class="num">${e(this.formatBs(p.monto))}</td>
      </tr>`).join('')
      : '<tr><td colspan="6">Sin pedidos registrados.</td></tr>';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte dashboard Abimar Shop ${e(stamp)}</title>
  <style>
    body { font-family: Segoe UI, Arial, sans-serif; color: #1a1a1a; margin: 32px; }
    h1 { margin: 0 0 4px; font-size: 22px; }
    h2 { margin: 28px 0 10px; font-size: 15px; border-bottom: 2px solid #00b8cc; padding-bottom: 4px; }
    .meta { color: #555; font-size: 13px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    th { background: #0b0b0d; color: #fff; }
    .num { text-align: right; white-space: nowrap; }
    .kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .kpi { border: 1px solid #ddd; padding: 12px; }
    .kpi strong { display: block; font-size: 18px; margin-top: 4px; }
    .kpi small { color: #666; }
    @media print { body { margin: 12px; } .kpis { grid-template-columns: 1fr 1fr 1fr 1fr; } }
  </style>
</head>
<body>
  <h1>Abimar Shop — Reporte de dashboard</h1>
  <p class="meta">Generado el ${e(stamp)} · Resumen operativo de la tienda</p>

  <h2>Indicadores</h2>
  <div class="kpis">
    <div class="kpi">Ingresos pagados<strong>${e(this.formatBs(data.ingresos.ingresosPagadosBs))}</strong>
      <small>Ticket prom. ${e(this.formatBs(data.ingresos.ticketPromedioBs))}</small></div>
    <div class="kpi">Pedidos<strong>${e(data.pedidos.total)}</strong>
      <small>${e(data.pedidos.pagados)} pag. · ${e(data.pedidos.entregados)} ent. · ${e(data.pedidos.pendientes)} pend.</small></div>
    <div class="kpi">Productos activos<strong>${e(data.catalogo.productosActivos)}</strong>
      <small>${e(data.catalogo.productosTotal)} total · ${e(data.catalogo.stockBajo)} stock bajo</small></div>
    <div class="kpi">Usuarios<strong>${e(data.usuarios.usuariosTotal)}</strong>
      <small>${e(data.usuarios.personasTotal)} personas · ${e(data.catalogo.categoriasTotal)} categorías</small></div>
  </div>

  <h2>Estados de pedidos</h2>
  <table>
    <tr><th>Pendientes</th><th>Pagados</th><th>Entregados</th><th>Cancelados</th></tr>
    <tr>
      <td class="num">${e(data.pedidos.pendientes)}</td>
      <td class="num">${e(data.pedidos.pagados)}</td>
      <td class="num">${e(data.pedidos.entregados)}</td>
      <td class="num">${e(data.pedidos.cancelados)}</td>
    </tr>
  </table>

  <h2>Ventas (7 días)</h2>
  <table>
    <tr><th>Día</th><th>Fecha</th><th>Monto</th><th>Pedidos</th></tr>
    ${ventasRows}
  </table>

  <h2>Métodos de pago</h2>
  <table>
    <tr><th>Método</th><th>Cantidad</th><th>%</th></tr>
    <tr><td>PayPal</td><td class="num">${e(data.pagos.paypal)}</td><td class="num">${e(this.pct(data.pagos.paypal, totalPagos))}%</td></tr>
    <tr><td>QR</td><td class="num">${e(data.pagos.qr)}</td><td class="num">${e(this.pct(data.pagos.qr, totalPagos))}%</td></tr>
    <tr><td>Sin definir</td><td class="num">${e(data.pagos.sinDefinir)}</td><td class="num">${e(this.pct(data.pagos.sinDefinir, totalPagos))}%</td></tr>
  </table>

  <h2>Top productos</h2>
  <table>
    <tr><th>#</th><th>Producto</th><th>Unidades</th><th>Monto</th></tr>
    ${topRows}
  </table>

  <h2>Pedidos recientes</h2>
  <table>
    <tr><th>Código</th><th>Cliente</th><th>Fecha</th><th>Pago</th><th>Estado</th><th>Monto</th></tr>
    ${recentRows}
  </table>
</body>
</html>`;
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2400,
      color,
      position: 'bottom',
      cssClass: 'custom-toast',
    });
    await toast.present();
  }
}
