import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { PedidoService } from '../services/pedido.service';

@Component({
  selector: 'app-qr-payment',
  templateUrl: './qr-payment.page.html',
  styleUrls: ['./qr-payment.page.scss'],
})
export class QrPaymentPage implements OnInit {
  total = 0;
  pedidoId = 0;
  codigoPedido = '';
  cargando = true;
  verificando = false;
  qrImage = 'assets/qr/qr.jpg';

  readonly pasos = [
    'Abre la app de tu banco o billetera',
    'Escanea el código QR de Abimar Shop',
    'Confirma el monto exacto en bolivianos',
    'Vuelve aquí y toca “Ya pagué”',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private pedidoService: PedidoService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.pedidoId =
      Number(this.route.snapshot.queryParamMap.get('pedidoId')) ||
      Number(localStorage.getItem('pedidoId')) ||
      0;

    if (this.pedidoId) {
      localStorage.setItem('pedidoId', String(this.pedidoId));
    }

    this.codigoPedido =
      this.route.snapshot.queryParamMap.get('codigo') ||
      localStorage.getItem('codigoPedido') ||
      this.pedidoService.codigoPublico(this.pedidoId);

    if (this.codigoPedido) {
      localStorage.setItem('codigoPedido', this.codigoPedido);
    }

    const totalParam = Number(this.route.snapshot.queryParamMap.get('total'));
    const stored = Number(localStorage.getItem('totalPedido'));

    if (!isNaN(totalParam) && totalParam > 0) {
      this.total = totalParam;
    } else if (!isNaN(stored) && stored > 0) {
      this.total = stored;
    } else {
      this.total = this.cartService.total;
    }

    if (this.total > 0) {
      localStorage.setItem('totalPedido', this.total.toFixed(2));
    }

    if (this.pedidoId) {
      this.marcarIntentoPagoQR();
    }

    // Breve feedback visual sin overlay modal
    setTimeout(() => {
      this.cargando = false;
    }, 450);
  }

  /** Deja registrado tipoPagoId=2 al elegir QR (evita "Sin definir" en admin). */
  private marcarIntentoPagoQR() {
    this.pedidoService.getPedidoById(this.pedidoId).subscribe({
      next: (pedido) => {
        const codigo = this.pedidoService.codigoPublico(pedido);
        if (codigo) {
          this.codigoPedido = codigo;
          localStorage.setItem('codigoPedido', codigo);
        }

        const tipo = Number(pedido?.tipoPagoId);
        if (tipo === 1 || tipo === 2) {
          return;
        }
        this.pedidoService
          .updatePedido({
            ...pedido,
            tipoPagoId: 2,
          })
          .subscribe({
            error: (err) => console.error('No se pudo marcar tipoPago QR', err),
          });
      },
      error: (err) => console.error('No se pudo leer pedido para QR', err),
    });
  }

  get hasPedido(): boolean {
    return this.pedidoId > 0 && this.total > 0;
  }

  onQrError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img && this.qrImage !== 'assets/qr.png') {
      this.qrImage = 'assets/qr.png';
      img.src = this.qrImage;
    }
  }

  async descargarQR() {
    try {
      const response = await fetch(this.qrImage);
      if (!response.ok) {
        throw new Error('No se pudo obtener la imagen');
      }

      const blob = await response.blob();
      const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
      const filename = this.pedidoId
        ? `abimar-qr-pedido-${this.pedidoId}.${ext}`
        : `abimar-qr.${ext}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      await this.mostrarToast('Imagen QR descargada', 'success');
    } catch {
      await this.mostrarToast('No se pudo descargar el QR', 'danger');
    }
  }

  async copiarMonto() {
    const texto = this.total.toFixed(2);
    try {
      await navigator.clipboard.writeText(texto);
      await this.mostrarToast('Monto copiado: ' + texto + ' Bs', 'success');
    } catch {
      await this.mostrarToast('No se pudo copiar el monto', 'warning');
    }
  }

  async confirmarPago() {
    if (!this.pedidoId || this.verificando) {
      return;
    }

    this.verificando = true;

    const loader = await this.loadingCtrl.create({
      message: 'Verificando pago...',
      spinner: 'crescent',
      cssClass: 'custom-loader',
    });
    await loader.present();

    this.pedidoService.getPedidoById(this.pedidoId).subscribe({
      next: async (resp) => {
        await loader.dismiss();
        this.verificando = false;

        if (resp?.status === 'PAGADO') {
          this.cartService.limpiar();
          const codigo =
            this.codigoPedido ||
            this.pedidoService.codigoPublico(resp) ||
            localStorage.getItem('codigoPedido') ||
            '';
          if (codigo) {
            localStorage.setItem('codigoPedido', codigo);
          }
          this.router.navigate(['/confirm'], {
            queryParams: {
              metodo: 'QR',
              total: this.total.toFixed(2),
              pedidoId: this.pedidoId,
              codigo: codigo || undefined,
            },
            replaceUrl: true,
          });
          return;
        }

        const alert = await this.alertCtrl.create({
          header: 'Pago aún no verificado',
          message:
            'Escanea el QR con tu app bancaria, paga el monto exacto y espera a que el equipo confirme el pedido. Luego vuelve a tocar “Ya pagué”.',
          buttons: ['Entendido'],
        });
        await alert.present();
      },
      error: async () => {
        await loader.dismiss();
        this.verificando = false;

        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo verificar el pago. Intenta nuevamente en unos segundos.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  volverMetodos() {
    this.router.navigate(['/payment-methods'], {
      queryParams: {
        pedidoId: this.pedidoId || undefined,
        total: this.total > 0 ? this.total.toFixed(2) : undefined,
      },
    });
  }

  irAHome() {
    this.router.navigate(['/home']);
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
      cssClass: 'custom-toast',
    });
    await toast.present();
  }
}
