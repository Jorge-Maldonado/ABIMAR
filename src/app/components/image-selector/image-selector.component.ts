import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-selector',
  templateUrl: './image-selector.component.html',
  styleUrls: ['./image-selector.component.scss'],
})
export class ImageSelectorComponent implements OnInit {
  imagenes: string[] = [];
  searchTerm = '';
  selectedImage: string | null = null;
  loading = true;
  loadError = '';

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadImages();
  }

  /** Lista estable vía assets/products/index.json (no depende de require.context). */
  loadImages() {
    this.loading = true;
    this.loadError = '';
    this.http.get<string[]>('assets/products/index.json').subscribe(
      (list) => {
        this.imagenes = Array.isArray(list)
          ? list.filter((n) => typeof n === 'string' && !!n.trim())
          : [];
        this.loading = false;
        if (!this.imagenes.length) {
          this.loadError = 'No hay imágenes en el catálogo local.';
        }
      },
      (err) => {
        console.error('Error cargando index.json de productos:', err);
        this.imagenes = [];
        this.loading = false;
        this.loadError = 'No se pudo cargar el listado de imágenes.';
      }
    );
  }

  filteredImages(): string[] {
    if (!this.searchTerm) return this.imagenes;
    const t = this.searchTerm.toLowerCase().trim();
    return this.imagenes.filter((n) => n.toLowerCase().includes(t));
  }

  displayName(img: string): string {
    if (!img) return '';
    return img.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
  }

  /** Un toque: seleccionar; segundo toque en la misma imagen: confirmar. */
  selectImage(img: string) {
    if (this.selectedImage === img) {
      this.chooseImage(img);
      return;
    }
    this.selectedImage = img;
  }

  chooseImage(img: string) {
    this.modalCtrl.dismiss(img, 'ok');
  }

  useSelected() {
    if (this.selectedImage) {
      this.modalCtrl.dismiss(this.selectedImage, 'ok');
    }
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
