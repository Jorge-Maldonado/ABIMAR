import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { PedidoService } from '../services/pedido.service';

declare var paypal: any;

/** Tasa Bs → USD usada en PayPal sandbox (catálogo en Bs). */
const BS_PER_USD = 9;

type MetodoPago = 'paypal' | 'qr' | null;

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
  paypalError = false;
  pedidoId: string | null = null;
  codigoPedido = '';
  actualizando = false;
  metodoSeleccionado: MetodoPago = null;

  readonly tasaCambio = BS_PER_USD;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.pedidoId =
      this.route.snapshot.queryParamMap.get('pedidoId') ||
      localStorage.getItem('pedidoId');

    if (this.pedidoId) {
      localStorage.setItem('pedidoId', this.pedidoId);
    }

    this.codigoPedido =
      this.route.snapshot.queryParamMap.get('codigo') ||
      localStorage.getItem('codigoPedido') ||
      this.pedidoService.codigoPublico(this.pedidoId);

    if (this.codigoPedido) {
      localStorage.setItem('codigoPedido', this.codigoPedido);
    }

    if (this.pedidoId && (!this.codigoPedido || /^\d+$/.test(this.codigoPedido))) {
      this.pedidoService.getPedidoById(+this.pedidoId).subscribe({
        next: (pedido) => {
          this.codigoPedido = this.pedidoService.codigoPublico(pedido);
          if (this.codigoPedido) {
            localStorage.setItem('codigoPedido', this.codigoPedido);
          }
          this.cdr.detectChanges();
        },
      });
    }

    const totalParam = this.route.snapshot.queryParamMap.get('total');
    if (totalParam && !isNaN(Number(totalParam)) && Number(totalParam) > 0) {
      this.totalBs = Number(totalParam);
    } else {
      const stored = Number(localStorage.getItem('totalPedido'));
      if (stored > 0) {
        this.totalBs = stored;
      } else {
        this.totalBs = this.cartService.total;
      }
    }

    this.totalUsd = this.toUsd(this.totalBs);
    if (this.totalBs > 0) {
      localStorage.setItem('totalPedido', this.totalBs.toFixed(2));
    }
    this.cargarPayPalScript();
  }

  get hasPedido(): boolean {
    return !!this.pedidoId && this.totalBs > 0;
  }

  /** Alias para plantillas que usaban `total`. */
  get total(): number {
    return this.totalBs;
  }

  private toUsd(bs: number): number {
    return Math.round((bs / BS_PER_USD) * 100) / 100;
  }

  cargarPayPalScript() {
    if (document.getElementById('paypal-sdk')) {
      this.paypalCargado = typeof paypal !== 'undefined';
      this.paypalError = !this.paypalCargado;
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=sb&currency=USD`;
    script.onload = () => {
      this.paypalCargado = true;
      this.paypalError = false;
      this.cdr.detectChanges();
      if (this.mostrarPayPal && this.metodoSeleccionado === 'paypal') {
        setTimeout(() => this.renderPayPalButtons(), 80);
      }
    };
    script.onerror = async () => {
      this.paypalCargado = false;
      this.paypalError = true;
      this.cdr.detectChanges();
      await this.mostrarToast('No se pudo cargar PayPal. Revisa tu conexión.', 'warning');
    };
    document.body.appendChild(script);
  }

  async seleccionarPayPal() {
    this.metodoSeleccionado = 'paypal';
    this.mostrarPayPal = true;
    this.cdr.detectChanges();

    if (!this.pedidoId) {
      await this.mostrarToast('No hay pedido asociado. Vuelve al checkout.', 'warning');
      return;
    }

    if (this.totalBs <= 0 || this.totalUsd <= 0) {
      await this.mostrarToast('El monto a pagar no es válido.', 'danger');
      return;
    }

    if (!this.paypalCargado || typeof paypal === 'undefined') {
      if (this.paypalError) {
        await this.mostrarToast('PayPal no está disponible. Prueba con QR.', 'warning');
      }
      return;
    }

    setTimeout(() => this.renderPayPalButtons(), 80);
  }

  private renderPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    if (!container) {
      return;
    }
    if (container.childElementCount > 0) {
      this.paypalRenderizado = true;
      return;
    }

    const usd = this.totalUsd;
    const bs = this.totalBs;
    const pedidoId = this.pedidoId;
    const codigo = this.codigoPedido || this.pedidoService.codigoPublico(pedidoId);

    paypal.Buttons({
      style: {
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        layout: 'vertical',
      },
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            description: `Pedido ${codigo || pedidoId} - Abimar Shop`,
            amount: {
              value: usd.toFixed(2),
              currency_code: 'USD',
            },
          }],
        });
      },
      onApprove: (_data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          this.marcarPedidoPagadoPayPal(details, bs, usd);
        });
      },
      onError: async (err: any) => {
        console.error('Error PayPal:', err);
        await this.mostrarToast('Error al procesar el pago con PayPal.', 'danger');
      },
    }).render('#paypal-button-container').then(() => {
      this.paypalRenderizado = true;
      this.cdr.detectChanges();
    });
  }

  private async marcarPedidoPagadoPayPal(details: any, totalBs: number, totalUsd: number) {
    if (this.actualizando || !this.pedidoId) {
      return;
    }
    this.actualizando = true;

    const loader = await this.loadingCtrl.create({
      message: 'Confirmando pago…',
      spinner: 'crescent',
      cssClass: 'custom-loader',
    });
    await loader.present();

    const txId =
      details?.id ||
      details?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      '';

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
            amountBs: totalBs,
          }),
        };

        this.pedidoService.updatePedido(payload).subscribe({
          next: async () => {
            await loader.dismiss();
            this.cartService.limpiar();
            localStorage.setItem('totalPedido', totalBs.toFixed(2));
            const codigo =
              this.codigoPedido ||
              this.pedidoService.codigoPublico(pedido) ||
              localStorage.getItem('codigoPedido') ||
              '';
            if (codigo) {
              localStorage.setItem('codigoPedido', codigo);
            }
            this.actualizando = false;
            this.router.navigate(['/confirm'], {
              queryParams: {
                metodo: 'PayPal',
                total: totalBs.toFixed(2),
                pedidoId: this.pedidoId,
                codigo: codigo || undefined,
              },
              replaceUrl: true,
            });
          },
          error: async () => {
            await loader.dismiss();
            this.actualizando = false;
            const alert = await this.alertCtrl.create({
              header: 'Pago recibido',
              message:
                'PayPal confirmó el pago, pero no se pudo actualizar el pedido. Guarda el código de pedido y contacta soporte.',
              buttons: ['Aceptar'],
            });
            await alert.present();
          },
        });
      },
      error: async () => {
        await loader.dismiss();
        this.actualizando = false;
        await this.mostrarToast('No se pudo verificar el pedido tras el pago.', 'danger');
      },
    });
  }

  async pagarConQR() {
    this.metodoSeleccionado = 'qr';
    this.mostrarPayPal = false;

    if (!this.pedidoId) {
      await this.mostrarToast('No hay pedido asociado. Vuelve al checkout.', 'warning');
      return;
    }

    if (this.totalBs <= 0) {
      await this.mostrarToast('El monto a pagar no es válido.', 'danger');
      return;
    }

    this.router.navigate(['/qr-payment'], {
      queryParams: {
        pedidoId: this.pedidoId,
        codigo: this.codigoPedido || undefined,
        total: this.totalBs.toFixed(2),
      },
    });
  }

  irACheckout() {
    this.router.navigate(['/checkout']);
  }

  irAHome() {
    this.router.navigate(['/home']);
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
