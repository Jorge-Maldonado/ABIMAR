import { Component, OnInit } from '@angular/core';

export interface DashboardSummary {
  pedidos: {
    total: number;
    pendientes: number;
    pagados: number;
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
  usingMock = true;
  data: DashboardSummary | null = null;

  /** Máximo de ventas del periodo (para barras relativas). */
  get maxVentaDia(): number {
    if (!this.data?.ventasPorDia?.length) return 1;
    return Math.max(...this.data.ventasPorDia.map(v => v.totalBs), 1);
  }

  get totalPagosMetodo(): number {
    if (!this.data) return 1;
    const p = this.data.pagos;
    return Math.max(p.paypal + p.qr + p.sinDefinir, 1);
  }

  constructor() {}

  ngOnInit() {
    this.cargarDashboard();
  }

  ionViewWillEnter() {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.loading = true;
    // Fase mock: simula latencia de red. Luego: DashboardService.getSummary()
    setTimeout(() => {
      this.data = this.buildMockSummary();
      this.usingMock = true;
      this.loading = false;
    }, 350);
  }

  getEstadoClase(status: string): string {
    switch (status) {
      case 'PAGADO': return 'st-ok';
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

  private buildMockSummary(): DashboardSummary {
    return {
      pedidos: {
        total: 48,
        pendientes: 9,
        pagados: 34,
        cancelados: 5
      },
      ingresos: {
        ingresosPagadosBs: 18450.75,
        ticketPromedioBs: 542.67
      },
      catalogo: {
        productosTotal: 56,
        productosActivos: 51,
        stockBajo: 7,
        categoriasTotal: 6
      },
      usuarios: {
        usuariosTotal: 22,
        personasTotal: 22
      },
      pedidosRecientes: [
        {
          idpedido: 128,
          monto: 459.00,
          status: 'PENDIENTE',
          fecha: '2026-08-09T10:22:00',
          clienteNombre: 'Ana Rojas',
          tipoPagoId: 2
        },
        {
          idpedido: 127,
          monto: 890.50,
          status: 'PAGADO',
          fecha: '2026-08-08T19:05:00',
          clienteNombre: 'Carlos Méndez',
          tipoPagoId: 1
        },
        {
          idpedido: 126,
          monto: 210.00,
          status: 'PAGADO',
          fecha: '2026-08-08T14:40:00',
          clienteNombre: 'Lucía Vargas',
          tipoPagoId: 2
        },
        {
          idpedido: 125,
          monto: 1250.00,
          status: 'CANCELADO',
          fecha: '2026-08-07T21:10:00',
          clienteNombre: 'Pedro Suárez',
          tipoPagoId: 1
        },
        {
          idpedido: 124,
          monto: 320.00,
          status: 'PAGADO',
          fecha: '2026-08-07T11:30:00',
          clienteNombre: 'María López',
          tipoPagoId: 2
        }
      ],
      ventasPorDia: [
        { fecha: '2026-08-03', label: 'Lun', totalBs: 1850, cantidad: 4 },
        { fecha: '2026-08-04', label: 'Mar', totalBs: 2420, cantidad: 6 },
        { fecha: '2026-08-05', label: 'Mié', totalBs: 1680, cantidad: 3 },
        { fecha: '2026-08-06', label: 'Jue', totalBs: 3100, cantidad: 7 },
        { fecha: '2026-08-07', label: 'Vie', totalBs: 2760, cantidad: 5 },
        { fecha: '2026-08-08', label: 'Sáb', totalBs: 3940, cantidad: 9 },
        { fecha: '2026-08-09', label: 'Dom', totalBs: 1520, cantidad: 3 }
      ],
      topProductos: [
        { productoId: 12, nombre: 'Cargador 45W Samsung', unidades: 28, montoBs: 5040 },
        { productoId: 8, nombre: 'Auriculares Bluetooth', unidades: 21, montoBs: 3780 },
        { productoId: 3, nombre: 'Cable USB-C 2m', unidades: 40, montoBs: 2000 },
        { productoId: 15, nombre: 'Power Bank 10000mAh', unidades: 14, montoBs: 2940 },
        { productoId: 5, nombre: 'Funda transparente', unidades: 33, montoBs: 1650 }
      ],
      pagos: {
        paypal: 19,
        qr: 22,
        sinDefinir: 7
      }
    };
  }
}
