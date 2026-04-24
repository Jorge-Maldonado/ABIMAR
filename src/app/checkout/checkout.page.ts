import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { forkJoin } from 'rxjs';
import { PedidoService } from '../services/pedido.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {

  carrito: any[] = [];

  descuento: number = 0;
  envio: number = 0;

  constructor(private cartService: CartService,
    private pedidoService: PedidoService,
    private router: Router,
    private alertCtrl: AlertController) { }

  ngOnInit() {
    this.cartService.items$.subscribe(data => {
      this.carrito = data;
    });
  }

  // ✅ MANTENIDOS para el HTML
  incrementarCantidad(item: any) {
    this.cartService.incrementar(item.id);
  }

  decrementarCantidad(item: any) {
    this.cartService.decrementar(item.id);
  }

  eliminarProducto(item: any) {
    this.cartService.eliminar(item.id);
  }

  get subtotal() {
    return this.cartService.total;
  }

  get total() {
    return this.subtotal - this.descuento + this.envio;
  }

  confirmarCompra() {

    if (this.carrito.length === 0) return;

    const pedidoPayload = {
      referenciaCobro: 'Compra App',
      idTransaccionPaypal: '',
      datosPaypal: '',
      personal: 1,
      fecha: new Date().toISOString(),
      costoEnvio: this.envio,
      monto: this.total,
      tipoPagoId: 2, // 1 PayPal | 2 QR (ajústalo luego)
      direccionEnvio: 'Santa Cruz, Bolivia',
      status: 'PENDIENTE'
    };

    console.log('CREANDO PEDIDO:', pedidoPayload);

    this.pedidoService.createPedido(pedidoPayload).subscribe({
      next: (pedidoResp) => {

        console.log('PEDIDO CREADO:', pedidoResp);

        const pedidoId = pedidoResp.idpedido || pedidoResp.id;

        if (!pedidoId) {
          console.error('No vino idpedido');
          return;
        }

        // 🔥 crear detalles en paralelo
        const detalles$ = this.carrito.map(item => {

          const detalle = {
            pedidoId: pedidoId,
            productoId: item.id,
            cantidad: item.cantidad,
            precio: item.precio,
            subtotal: item.precio * item.cantidad
          };

          return this.pedidoService.createDetalle(detalle);
        });

        // 🔥 ejecutar todos los detalles
        forkJoin(detalles$).subscribe({
          next: () => {
            console.log('DETALLES CREADOS');

            alert('Compra realizada correctamente ✅');

            this.cartService.limpiar();
          },
          error: (err) => {
            console.error('Error creando detalles', err);
          }
        });

      },
      error: (err) => {
        console.error('Error creando pedido', err);
      }
    });
  }
  async registrarPedido() {

    if (this.carrito.length === 0) return;

    const payload = {
      referenciaCobro: 'Compra App',
      idTransaccionPaypal: '',
      datosPaypal: '',
      personal: 1,
      fecha: new Date().toISOString(),
      costoEnvio: this.envio,
      monto: this.total,
      tipoPagoId: 0,
      direccionEnvio: 'Santa Cruz, Bolivia',
      status: 'PENDIENTE'
    };

    console.log('CREANDO PEDIDO:', payload);

    this.pedidoService.createPedido(payload).subscribe({
      next: async (resp) => {

        console.log('RESP:', resp);

        const pedidoId = resp?.idpedido || resp?.id;

        if (!pedidoId) {
          console.error('No vino idpedido');
          return;
        }

        // 🔥 crear detalles en paralelo
        const detalles$ = this.carrito.map(item => {

          const detalle = {
            pedidoId: pedidoId,
            productoId: item.id,
            cantidad: item.cantidad,
            precio: item.precio,
            subtotal: item.precio * item.cantidad
          };

          return this.pedidoService.createDetalle(detalle);
        });

        // 🔥 ejecutar todos los detalles
        forkJoin(detalles$).subscribe({
          next: () => {
            console.log('DETALLES CREADOS');
          },
          error: (err) => {
            console.error('Error creando detalles', err);
          }
        });

        // 🔥 guardar para siguientes pantallas
        localStorage.setItem('pedidoId', pedidoId);
        localStorage.setItem('totalPedido', this.envio.toString());
        // 🔥 LIMPIAR carrito (mejor UX)
        //this.cartService.limpiar();

        // 🔥 ALERT BIEN CONTROLADO
        const alert = await this.alertCtrl.create({
          header: 'Pedido registrado',
          message: `Tu pedido #${pedidoId} fue creado correctamente.`,
          backdropDismiss: false,
          buttons: [
            {
              text: 'Continuar al pago',
              handler: () => {

                console.log('NAVEGANDO...');

                this.router.navigate(['/payment-methods'], {
                  queryParams: { pedidoId }
                });

              }
            }
          ]
        });

        await alert.present();
      },

      error: (err) => {
        console.error('Error creando pedido', err);
      }
    });
  }
}