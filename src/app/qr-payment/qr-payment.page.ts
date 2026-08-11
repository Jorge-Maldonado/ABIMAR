import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
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
  busyMedia = false;
  qrImage = 'assets/qr/qr.jpg';

  /** Solo Cordova/APK: botón Compartir. */
  isNativeApp = false;

  readonly pasos = [
    'Abre la app de tu banco o billetera',
    'Escanea el código QR de Abimar Shop',
    'Confirma el monto exacto en bolivianos',
    'Vuelve aquí y toca “Ya pagué”',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private pedidoService: PedidoService,
    private cartService: CartService,
    private file: File,
    private socialSharing: SocialSharing
  ) {}

  ngOnInit() {
    this.isNativeApp = this.platform.is('cordova') || !!(window as any).cordova;

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

    setTimeout(() => {
      this.cargando = false;
    }, 450);
  }

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
    if (this.busyMedia) {
      return;
    }
    this.busyMedia = true;
    try {
      const { blob, filename, dataUrl } = await this.loadQrMedia();

      if (this.isNativeApp) {
        await this.guardarQrNativo(blob, filename, dataUrl);
      } else {
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
      }
    } catch (err) {
      console.error('descargarQR', err);
      await this.mostrarToast('No se pudo descargar el QR', 'danger');
    } finally {
      this.busyMedia = false;
    }
  }

  /** Solo APK/Cordova: hoja de compartir nativa. */
  async compartirQR() {
    if (!this.isNativeApp || this.busyMedia) {
      return;
    }
    this.busyMedia = true;
    try {
      const { dataUrl } = await this.loadQrMedia();
      const codigo = this.codigoPedido || (this.pedidoId ? `#${this.pedidoId}` : '');
      const mensaje =
        `QR de pago Abimar Shop` +
        (codigo ? ` — Pedido ${codigo}` : '') +
        ` — Bs. ${this.total.toFixed(2)}`;

      await this.socialSharing.share(mensaje, 'Pago QR Abimar Shop', dataUrl, null);
    } catch (err) {
      console.error('compartirQR', err);
      await this.mostrarToast('No se pudo compartir el QR', 'danger');
    } finally {
      this.busyMedia = false;
    }
  }

  private resolveQrUrl(): string {
    const src = this.qrImage || 'assets/qr/qr.jpg';
    if (/^https?:\/\//i.test(src) || src.startsWith('data:')) {
      return src;
    }
    try {
      return new URL(src, document.baseURI || window.location.href).href;
    } catch {
      return src;
    }
  }

  private async loadQrMedia(): Promise<{ blob: Blob; filename: string; dataUrl: string }> {
    const response = await fetch(this.resolveQrUrl());
    if (!response.ok) {
      throw new Error('No se pudo obtener la imagen');
    }
    const blob = await response.blob();
    const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const filename = this.pedidoId
      ? `abimar-qr-pedido-${this.pedidoId}.${ext}`
      : `abimar-qr.${ext}`;
    const dataUrl = await this.blobToDataUrl(blob);
    return { blob, filename, dataUrl };
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('FileReader'));
      reader.readAsDataURL(blob);
    });
  }

  private async guardarQrNativo(blob: Blob, filename: string, dataUrl: string) {
    try {
      const dir = await this.resolveDownloadDir();
      await this.file.writeFile(dir, filename, blob, { replace: true });
      await this.mostrarToast('QR guardado en Descargas', 'success');
    } catch (writeErr) {
      console.warn('writeFile falló, abriendo compartir…', writeErr);
      try {
        await this.socialSharing.share(
          'Guarda esta imagen del QR de pago Abimar Shop',
          'QR Abimar Shop',
          dataUrl,
          null
        );
        await this.mostrarToast('Elige “Guardar” o “Archivos” en el menú', 'warning');
      } catch (shareErr) {
        console.error(shareErr);
        throw writeErr;
      }
    }
  }

  private async resolveDownloadDir(): Promise<string> {
    const external = (this.file as any).externalRootDirectory as string | null;
    if (external) {
      const downloadPath = external + 'Download/';
      try {
        await this.file.checkDir(external, 'Download');
      } catch {
        try {
          await this.file.createDir(external, 'Download', false);
        } catch {
          // si no puede crear Download, usa dataDirectory
          return this.file.dataDirectory;
        }
      }
      return downloadPath;
    }
    return this.file.dataDirectory;
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
      duration: 2200,
      color,
      position: 'bottom',
      cssClass: 'custom-toast',
    });
    await toast.present();
  }
}
