import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-qr-payment',
  templateUrl: './qr-payment.page.html',
  styleUrls: ['./qr-payment.page.scss'],
})
export class QrPaymentPage implements OnInit {
  total: number = 0;
  textoQR: string = '';
  cargando: boolean = true;

  constructor(private router: Router, private loadingCtrl: LoadingController) {}

  async ngOnInit() {
    await this.mostrarLoader();
    this.calcularTotal();
    this.generarQR();
  }

  calcularTotal() {
    const data = localStorage.getItem('carrito');
    const carrito = data ? JSON.parse(data) : [];
    const subtotal = carrito.reduce(
      (sum: number, p: any) => sum + p.precio * p.cantidad,
      0
    );
    const envio = subtotal * 0.1;
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

  confirmarPago() {
    alert('✅ Pago confirmado exitosamente.');
    localStorage.removeItem('carrito');
    this.router.navigate(['/confirm'], {
      queryParams: { metodo: 'QR', total: this.total },
    });
  }
}
