import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { PedidoService } from '../services/pedido.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-qr-payment',
  templateUrl: './qr-payment.page.html',
  styleUrls: ['./qr-payment.page.scss'],
})
export class QrPaymentPage implements OnInit {
  total: number = 0;
  textoQR: string = '';
  cargando: boolean = true;
  pedidoId!: number;

  constructor(private route: ActivatedRoute, private router: Router, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, private pedidoService: PedidoService
  ) {}

  async ngOnInit() {
    await this.mostrarLoader();
    this.pedidoId = Number(this.route.snapshot.queryParamMap.get('pedidoId'))
      || Number(localStorage.getItem('pedidoId'))
      || 0;
    if (this.pedidoId) {
      localStorage.setItem('pedidoId', this.pedidoId.toString());
    }

    const totalParam = Number(this.route.snapshot.queryParamMap.get('total'));
    const stored = Number(localStorage.getItem('totalPedido'));
    if (!isNaN(totalParam) && totalParam > 0) {
      this.total = totalParam;
    } else if (!isNaN(stored) && stored > 0) {
      this.total = stored;
    } else {
      this.calcularTotal();
    }
    localStorage.setItem('totalPedido', this.total.toFixed(2));
    this.generarQR();
  }

  calcularTotal() {
    const data = localStorage.getItem('carrito');
    const carrito = data ? JSON.parse(data) : [];
    const subtotal = carrito.reduce(
      (sum: number, p: any) => sum + p.precio * p.cantidad,
      0
    );
    const envio = 0;
    this.total = subtotal + envio;
  }

  async generarQR() {
    // Simulamos un pequeño retardo visual
    setTimeout(async () => {
      this.textoQR = `Pago QR - Monto: ${this.total.toFixed(2)} Bs`;
      await this.ocultarLoader();
    }, 1200);
  }

  async mostrarLoader() {
    this.cargando = true;
    const loader = await this.loadingCtrl.create({
      message: 'Generando código QR...',
      spinner: 'crescent',
      cssClass: 'custom-loader',
    });
    await loader.present();
  }

  async ocultarLoader() {
    this.cargando = false;
    await this.loadingCtrl.dismiss();
  }

async confirmarPago() {

  const pedidoId = localStorage.getItem('pedidoId');

  if (!pedidoId) {
    console.error('No hay pedidoId');
    return;
  }

  const loader = await this.loadingCtrl.create({
    message: 'Verificando pago...',
    spinner: 'crescent'
  });

  await loader.present();

  this.pedidoService.getPedidoById(+pedidoId).subscribe({

    next: async (resp) => {

      await loader.dismiss();

      console.log('PEDIDO:', resp);

      if (resp.status === 'PAGADO') {
        localStorage.removeItem('carrito');
        this.router.navigate(['/confirm'], {
          queryParams: {
            metodo: 'QR',
            total: this.total.toFixed(2),
            pedidoId: pedidoId
          },
          replaceUrl: true
        });

      } else {

        // ⚠️ NO pagado aún
        const alert = await this.alertCtrl.create({
          header: 'Pago en proceso',
          message: 'Realice el pago total de su compra mediante su APP bancaria y espere su verificación.',
          buttons: ['Entendido']
        });

        await alert.present();
      }

    },

    error: async (err) => {

      await loader.dismiss();

      console.error(err);

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo verificar el pago. Intente nuevamente.',
        buttons: ['OK']
      });

      await alert.present();
    }

  });
}
}
