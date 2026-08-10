import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PedidoService } from '../services/pedido.service';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class ConfirmPage implements OnInit {
  metodo = '';
  total = 0;
  pedidoId = '';
  codigoPedido = '';

  /** Canal WhatsApp Abimar Shop */
  readonly whatsappDisplay = '+591 73283217';
  private readonly whatsappNumber = '59173283217';

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.metodo = params['metodo'] || '';
      this.pedidoId = params['pedidoId'] || localStorage.getItem('pedidoId') || '';
      this.codigoPedido =
        params['codigo'] ||
        localStorage.getItem('codigoPedido') ||
        this.pedidoService.codigoPublico(this.pedidoId);

      const fromQuery = Number(params['total']);
      if (!isNaN(fromQuery) && fromQuery > 0) {
        this.total = fromQuery;
      } else {
        const stored = Number(localStorage.getItem('totalPedido'));
        this.total = !isNaN(stored) && stored > 0 ? stored : 0;
      }

      // Si solo tenemos id, intenta leer referenciaCobro del backend
      if (this.pedidoId && (!params['codigo'] && !localStorage.getItem('codigoPedido'))) {
        this.pedidoService.getPedidoById(+this.pedidoId).subscribe({
          next: (pedido) => {
            this.codigoPedido = this.pedidoService.codigoPublico(pedido);
            if (this.codigoPedido) {
              localStorage.setItem('codigoPedido', this.codigoPedido);
            }
          },
          error: () => { /* keep fallback */ },
        });
      }
    });
  }

  get metodoLabel(): string {
    const m = (this.metodo || '').trim().toLowerCase();
    if (m === 'paypal') return 'PayPal';
    if (m === 'qr') return 'Pago con QR';
    return this.metodo || '—';
  }

  get codigoVisible(): string {
    return this.codigoPedido || this.pedidoService.codigoPublico(this.pedidoId) || '—';
  }

  abrirWhatsApp() {
    const codigo = this.codigoVisible !== '—' ? this.codigoVisible : '';
    const totalTxt = this.total > 0 ? `Bs. ${this.total.toFixed(2)}` : '';
    const msg = [
      'Hola Abimar Shop,',
      `acabo de confirmar mi pedido${codigo ? ` ${codigo}` : ''}${totalTxt ? ` por ${totalTxt}` : ''}.`,
      'Quedo atento/a para coordinar la entrega por WhatsApp.',
    ].join(' ');

    const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.href = url;
    }
  }
}
