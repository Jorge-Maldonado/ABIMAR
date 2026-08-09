import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class ConfirmPage implements OnInit {
  metodo = '';
  total = 0;
  pedidoId = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.metodo = params['metodo'] || '';
      this.pedidoId = params['pedidoId'] || localStorage.getItem('pedidoId') || '';

      const fromQuery = Number(params['total']);
      if (!isNaN(fromQuery) && fromQuery > 0) {
        this.total = fromQuery;
      } else {
        const stored = Number(localStorage.getItem('totalPedido'));
        this.total = !isNaN(stored) && stored > 0 ? stored : 0;
      }
    });
  }
}
