import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.page.html',
  styleUrls: ['./item-details.page.scss'],
})
export class ItemDetailsPage implements OnInit {

  producto: any;
  selectedOptions: { [key: string]: any } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params && params['producto']) {
        this.producto = JSON.parse(params['producto']);

        // 🔥 DEBUG (opcional)
        console.log('Producto recibido:', this.producto);
      }
    });
  }

  // ===============================
  // 🛒 AGREGAR AL CARRITO (FIX REAL)
  // ===============================
  async agregarAlCarrito(): Promise<boolean> {

    if (!this.producto) {
      console.error('Producto no definido');
      return false;
    }

    // 🔥 NORMALIZAR ID (CLAVE DEL ÉXITO)
    const productId = this.producto.idproducto || this.producto.id;

    if (!productId) {
      console.error('Producto sin ID válido');
      return false;
    }

    this.cartService.add({
      ...this.producto,
      idproducto: productId, // 🔥 aseguramos consistencia
      options: this.selectedOptions
    });

    await this.mostrarToast(`"${this.producto.nombre}" agregado al carrito 🛒`, 'warning');

    return true;
  }

  // ===============================
  // 💳 COMPRAR AHORA
  // ===============================
  async comprarAhora() {

    const agregado = await this.agregarAlCarrito();
    if (!agregado) return;

    // 🔥 navegación directa (ya no necesitas setTimeout)
    this.router.navigate(['/my-cart']);
  }

  // ===============================
  // ❤️ FAVORITOS
  // ===============================
  async agregarFavorito(producto: any) {
    await this.mostrarToast(`"${producto.nombre}" agregado a favoritos ❤️`, 'warning');
  }

  // ===============================
  // 🔔 TOAST
  // ===============================
  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  // ===============================
  // 🔥 VARIANTES
  // ===============================
  selectOption(tipo: string, valor: any) {
    this.selectedOptions[tipo] = valor;
  }
}