import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '../services/cart.service';
import { PedidoService } from '../services/pedido.service';
import { AlertController } from '@ionic/angular';

declare var paypal: any;

/** Tasa Bs → USD usada en PayPal sandbox (catálogo en Bs). */
const BS_PER_USD = 9;

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.page.html',
  styleUrls: ['./payment-methods.page.scss'],
})
export class PaymentMethodsPage implements OnInit {

  /** Monto del pedido en bolivianos (fuente de verdad para UI y backend). */
  totalBs = 0;
  /** Monto cobrado en PayPal (USD). */
  totalUsd = 0;
  mostrarPayPal = false;
  paypalCargado = false;
  paypalRenderizado = false;
  pedidoId: string | null = null;
  actualizando = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.pedidoId = this.route.snapshot.queryParamMap.get('pedidoId')
      || localStorage.getItem('pedidoId');

    const totalParam = this.route.snapshot.queryParamMap.get('total');
    if (totalParam && !isNaN(Number(totalParam)) && Number(totalParam) > 0) {
      this.totalBs = Number(totalParam);
    } else {
      const stored = Number(localStorage.getItem('totalPedido'));
      if (stored > 0) {
        this.totalBs = stored;
      } else {
        this.calcularTotalDesdeCarrito();
      }
    }

    this.totalUsd = this.toUsd(this.totalBs);
    localStorage.setItem('totalPedido', this.totalBs.toFixed(2));
    this.cargarPayPalScript();
  }

  /** Alias para plantillas que usaban `total`. */
  get total(): number {
    return this.totalBs;
  }

  get getTotal(): number {
    return this.totalBs > 0 ? this.totalBs : this.cartService.total;
  }

  private toUsd(bs: number): number {
    return Math.round((bs / BS_PER_USD) * 100) / 100;
  }

  private calcularTotalDesdeCarrito() {
    const data = localStorage.getItem('carrito');
    const carrito = data ? JSON.parse(data) : [];
    this.totalBs = carrito.reduce(
      (sum: number, p: any) => sum + (Number(p.precio) || 0) * (Number(p.cantidad) || 0),
      0
    );
  }

  cargarPayPalScript() {
    if (document.getElementById('paypal-sdk')) {
      this.paypalCargado = typeof paypal !== 'undefined';
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=sb&currency=USD`;
    script.onload = () => {
      this.paypalCargado = true;
      this.cdr.detectChanges();
    };
    script.onerror = () => {
      this.paypalCargado = false;
      alert('No se pudo cargar PayPal. Revisa tu conexión.');
    };
    document.body.appendChild(script);
  }

  async pagarConPayPal() {
    if (!this.paypalCargado || typeof paypal === 'undefined') {
      alert('Espera a que el SDK de PayPal cargue...');
      return;
    }

    if (!this.pedidoId) {
      alert('No hay pedido asociado. Vuelve al checkout.');
      return;
    }

    if (this.totalBs <= 0 || this.totalUsd <= 0) {
      alert('El monto a pagar no es válido.');
      return;
    }

    this.mostrarPayPal = true;
    this.cdr.detectChanges();

    if (this.paypalRenderizado) return;

    setTimeout(() => {
      const container = document.getElementById('paypal-button-container');
      if (!container) {
        console.error('Contenedor PayPal no encontrado');
        return;
      }
      if (container.childElementCount > 0) {
        this.paypalRenderizado = true;
        return;
      }

      const usd = this.totalUsd;
      const bs = this.totalBs;
      const pedidoId = this.pedidoId;

      paypal.Buttons({
        style: {
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          layout: 'vertical'
        },
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: `Pedido #${pedidoId} - Abimar Shop`,
              amount: {
                value: usd.toFixed(2),
                currency_code: 'USD'
              }
            }]
          });
        },
        onApprove: (_data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            this.marcarPedidoPagadoPayPal(details, bs, usd);
          });
        },
        onError: (err: any) => {
          console.error('Error PayPal:', err);
          alert('Error al procesar el pago con PayPal.');
        }
      }).render('#paypal-button-container').then(() => {
        this.paypalRenderizado = true;
      });
    }, 100);
  }

  private marcarPedidoPagadoPayPal(details: any, totalBs: number, totalUsd: number) {
    if (this.actualizando || !this.pedidoId) return;
    this.actualizando = true;

    const txId = details?.id || details?.purchase_units?.[0]?.payments?.captures?.[0]?.id || '';

    this.pedidoService.getPedidoById(+this.pedidoId).subscribe({
      next: (pedido: any) => {
        const payload = {
          ...pedido,
          status: 'PAGADO',
          tipoPagoId: 1,
          monto: totalBs,
          idTransaccionPaypal: txId,
          datosPaypal: JSON.stringify({
            orderId: details?.id,
            status: details?.status,
            payer: details?.payer?.email_address,
            amountUsd: totalUsd,
            amountBs: totalBs
          })
        };

        this.pedidoService.updatePedido(payload).subscribe({
          next: () => {
            this.cartService.limpiar();
            localStorage.setItem('totalPedido', totalBs.toFixed(2));
            this.actualizando = false;
            this.router.navigate(['/confirm'], {
              queryParams: {
                metodo: 'PayPal',
                total: totalBs.toFixed(2),
                pedidoId: this.pedidoId
              },
              replaceUrl: true
            });
          },
          error: async (err) => {
            this.actualizando = false;
            console.error('Error actualizando pedido', err);
            const alert = await this.alertCtrl.create({
              header: 'Pago recibido',
              message: 'PayPal confirmó el pago, pero no se pudo actualizar el pedido. Guarda el número de pedido y contacta soporte.',
              buttons: ['Aceptar']
            });
            await alert.present();
          }
        });
      },
      error: async (err) => {
        this.actualizando = false;
        console.error('Error obteniendo pedido', err);
        alert('No se pudo verificar el pedido tras el pago.');
      }
    });
  }

  pagarConQR() {
    if (!this.pedidoId) {
      alert('No hay pedido asociado. Vuelve al checkout.');
      return;
    }
    this.router.navigate(['/qr-payment'], {
      queryParams: {
        pedidoId: this.pedidoId,
        total: this.totalBs.toFixed(2)
      }
    });
  }
}
