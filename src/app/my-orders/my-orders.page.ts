import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.page.html',
  styleUrls: ['./my-orders.page.scss'],
})
export class MyOrdersPage implements OnInit {

  // Array de pedidos de ejemplo — reemplazar con llamada al backend cuando esté disponible
  pedidos = [
    { nombre: 'Parlante JBL',         marca: 'JBL',     precio: 34.00, imagen: 'assets/cart/cart1.png' },
    { nombre: 'Audífonos',            marca: 'Apple',   precio: 44.00, imagen: 'assets/cart/cart2.png' },
    { nombre: 'Cargador',             marca: 'Samsung', precio: 30.00, imagen: 'assets/cart/cart3.png' },
    { nombre: 'Cargador Auto',        marca: 'JSS',     precio: 54.00, imagen: 'assets/cart/cart4.png' },
    { nombre: 'Cargador Portátil',    marca: 'Samsung', precio: 50.00, imagen: 'assets/cart/cart5.png' },
  ];

  constructor() { }

  ngOnInit() { }
}
