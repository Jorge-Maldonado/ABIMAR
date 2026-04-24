import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { ActivatedRoute } from '@angular/router';


declare var paypal: any;

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.page.html',
  styleUrls: ['./payment-methods.page.scss'],
})
export class PaymentMethodsPage implements OnInit {

  total: number = 0;
  mostrarPayPal = false;
  paypalCargado = false;
  pedidoId: any | null = null;

  constructor(private router: Router, private cdr: ChangeDetectorRef, private cartService: CartService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.pedidoId = this.route.snapshot.queryParamMap.get('pedidoId');
    console.log('PEDIDO ID:', this.pedidoId);
    this.calcularTotal();
    this.cargarPayPalScript();
  }

  calcularTotal() {
    const data = localStorage.getItem('carrito');
    const carrito = data ? JSON.parse(data) : [];
    const subtotal = carrito.reduce((sum: number, p: any) => sum + (p.precio * p.cantidad), 0);
    const envio = subtotal * 0.10;
    this.total = subtotal + envio;
  }

  cargarPayPalScript() {
    if (document.getElementById('paypal-sdk')) return;

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD'; // sb = Sandbox
    script.onload = () => {
      console.log('✅ PayPal SDK cargado');
      this.paypalCargado = true;
    };
    document.body.appendChild(script);
  }

  pagarConPayPal() {
    if (!this.paypalCargado) {
      alert('Espera a que el SDK de PayPal cargue...');
      return;
    }

    this.mostrarPayPal = true;
    this.cdr.detectChanges(); // Fuerza a Angular a renderizar el contenedor

    // Evita duplicar botones
    const container = document.getElementById('paypal-button-container');
    if (!container) {
      console.error('Contenedor PayPal no encontrado');
      return;
    }
    if (container.childElementCount > 0) return;

    setTimeout(() => { // Pequeño delay para asegurar que el contenedor está en el DOM
      paypal.Buttons({
        style: {
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          layout: 'vertical'
        },

        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: 'Compra en MiTienda',
              amount: {
                value: this.total.toFixed(2),
                currency_code: 'USD'
              }
            }]
          });
        },

        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            console.log('Pago aprobado:', details);
            localStorage.removeItem('carrito');
            this.router.navigate(['/confirm'], {
              queryParams: { metodo: 'PayPal', total: this.total }
            });
          });
        },

        onError: (err: any) => {
          console.error('Error PayPal:', err);
          alert('Error al procesar el pago con PayPal.');
        }

      }).render('#paypal-button-container');
    }, 100); // Delay 100ms
  }

  pagarConQR() {
    this.router.navigate(['/qr-payment'], {
      queryParams: { pedidoId: this.pedidoId }
    });
  }

  get getTotal() {
    return this.cartService.total;
  }

}
