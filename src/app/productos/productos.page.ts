import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {

  nombre: string = '';
  descripcion: string = '';
  precio: number = 0;
  stock: number = 0;
  imagen: string = '';
  productos: any[] = [];

  constructor(private apiService: ApiService<any>) {}

  ngOnInit() {
    this.loadProductos();
  }

  loadProductos() {
    this.apiService.get('https://backend-abimar.onrender.com/abimar/core/api/producto/read?id=0')
      .subscribe(
        (res: any) => {
          this.productos = Array.isArray(res) ? res : [res];
        },
        err => console.error('Error cargando productos:', err)
      );
  }

  createProducto() {
    const producto = {
      categoriaId: 1, // 👉 Ajusta según categorías existentes
      codigo: `PRD-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      descripcion: this.descripcion,
      idproducto: 0,
      imagen: this.imagen,
      nombre: this.nombre,
      precio: this.precio,
      ruta: this.nombre.toLowerCase().replace(/\s+/g, '-'),
      status: 1,
      stock: this.stock
    };

    this.apiService.post('https://backend-abimar.onrender.com/abimar/core/api/producto/create', producto)
      .subscribe(
        () => {
          this.resetForm();
          this.loadProductos();
        },
        err => console.error('Error creando producto:', err)
      );
  }

  deleteProducto(id: number) {
    this.apiService.delete(`https://backend-abimar.onrender.com/abimar/core/api/producto/delete?id=${id}`)
      .subscribe(
        () => this.loadProductos(),
        err => console.error('Error eliminando producto:', err)
      );
  }

  private resetForm() {
    this.nombre = '';
    this.descripcion = '';
    this.precio = 0;
    this.stock = 0;
    this.imagen = '';
  }
}
