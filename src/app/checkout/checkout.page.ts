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
  registrando = false;

  constructor(
    private cartService: CartService,
    private pedidoService: PedidoService,
    private router: Router,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.cartService.items$.subscribe(data => {
      this.carrito = data;
    });
  }

  private productId(item: any): number {
    return Number(item.idproducto ?? item.id);
  }

  incrementarCantidad(item: any) {
    this.cartService.incrementar(this.productId(item));
  }

  decrementarCantidad(item: any) {
    this.cartService.decrementar(this.productId(item));
  }

  eliminarProducto(item: any) {
    this.cartService.eliminar(this.productId(item));
  }

  get subtotal() {
    return this.cartService.total;
  }

  get total() {
    return this.subtotal - this.descuento + this.envio;
  }

  get totalItems() {
    return this.cartService.totalItems;
  }

  async registrarPedido() {
    if (this.carrito.length === 0 || this.registrando) return;

    const personal = Number(localStorage.getItem('personal')) || 0;
    if (!personal) {
      const alert = await this.alertCtrl.create({
        header: 'Sesión requerida',
        message: 'Debes iniciar sesión para registrar el pedido.',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    const monto = Number(this.total);
    if (!monto || monto <= 0) {
      const alert = await this.alertCtrl.create({
        header: 'Monto inválido',
        message: 'El total del pedido debe ser mayor a cero.',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    this.registrando = true;

    const codigoPedido = this.pedidoService.generarCodigoPedido();

    const payload = {
      referenciaCobro: codigoPedido,
      idTransaccionPaypal: '',
      datosPaypal: '',
      personal,
      fecha: new Date().toISOString(),
      costoEnvio: this.envio,
      monto,
      tipoPagoId: 0,
      direccionEnvio: 'Santa Cruz, Bolivia',
      status: 'PENDIENTE'
    };

    this.pedidoService.createPedido(payload).subscribe({
      next: (resp) => {
        const pedidoId = resp?.idpedido || resp?.id;
        if (!pedidoId) {
          this.registrando = false;
          console.error('No vino idpedido');
          return;
        }

        const codigo =
          this.pedidoService.codigoPublico(resp?.referenciaCobro || codigoPedido) ||
          codigoPedido;

        const detalles$ = this.carrito.map(item => {
          const precio = Number(item.precio) || 0;
          const cantidad = Number(item.cantidad) || 0;
          return this.pedidoService.createDetalle({
            pedidoId,
            productoId: this.productId(item),
            cantidad,
            precio,
            subtotal: precio * cantidad
          });
        });

        forkJoin(detalles$).subscribe({
          next: async () => {
            localStorage.setItem('pedidoId', String(pedidoId));
            localStorage.setItem('codigoPedido', codigo);
            localStorage.setItem('totalPedido', monto.toFixed(2));

            this.registrando = false;

            const alert = await this.alertCtrl.create({
              header: 'Pedido registrado',
              message: `Tu pedido ${codigo} por Bs. ${monto.toFixed(2)} fue creado correctamente.`,
              backdropDismiss: false,
              buttons: [{
                text: 'Continuar al pago',
                handler: () => {
                  this.router.navigate(['/payment-methods'], {
                    queryParams: {
                      pedidoId,
                      codigo,
                      total: monto.toFixed(2)
                    }
                  });
                }
              }]
            });
            await alert.present();
          },
          error: async (err) => {
            this.registrando = false;
            console.error('Error creando detalles', err);
            const alert = await this.alertCtrl.create({
              header: 'Error',
              message: 'El pedido se creó pero falló el detalle. Intenta de nuevo.',
              buttons: ['Aceptar']
            });
            await alert.present();
          }
        });
      },
      error: async (err) => {
        this.registrando = false;
        console.error('Error creando pedido', err);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo registrar el pedido. Intenta de nuevo.',
          buttons: ['Aceptar']
        });
        await alert.present();
      }
    });
  }
}
