import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { ActivatedRoute } from '@angular/router';
import { PedidoService } from '../services/pedido.service';

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

  constructor(private router: Router, private cdr: ChangeDetectorRef, private cartService: CartService, private route: ActivatedRoute, private pedidoService: PedidoService) { }

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

    this.total = subtotal + 0; // Aquí podrías agregar costos adicionales como envío o impuestos
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
    this.total = this.total / 9; // Asegura que el total esté actualizado
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
            this.cartService.limpiar();
            //Actualizacion estado del pedido a PAGADO
            if (!this.pedidoId) {
              console.error('No hay pedidoId');
              return;
            }

            // 🔥 1. Obtener pedido actual
            this.pedidoService.getPedidoById(+this.pedidoId).subscribe({

              next: (pedido: any) => {

                // 🔥 2. Cambiar estado a PAGADO
                const payload = {
                  ...pedido,
                  status: 'PAGADO'
                };

                console.log('ACTUALIZANDO PEDIDO:', payload);

                // 🔥 3. Guardar en backend
                this.pedidoService.updatePedido(payload).subscribe({

                  next: () => {

                    console.log('✅ Pedido actualizado a PAGADO');

                    // 🔥 4. Limpiar carrito
                    this.cartService.limpiar();

                    // 🔥 5. Navegar
                    this.router.navigate(['/confirm'], {
                      queryParams: {
                        metodo: 'PayPal',
                        total: this.total
                      }
                    });

                  },

                  error: (err) => {
                    console.error('Error actualizando pedido', err);
                  }

                });

              },

              error: (err) => {
                console.error('Error obteniendo pedido', err);
              }

            });
            //localStorage.removeItem('carrito');
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
