import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

declare const require: any; // necesario para require.context

@Component({
  selector: 'app-image-selector',
  templateUrl: './image-selector.component.html',
  styleUrls: ['./image-selector.component.scss'],
})
export class ImageSelectorComponent implements OnInit {
  imagenes: string[] = [];
  searchTerm: string = '';
  selectedImage: string | null = null;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.loadImages();
  }

  // Cargar todas las imágenes desde assets/products (png/jpg/jpeg)
  loadImages() {
    const req = require.context(
      '../../../assets/products/',
      false,
      /\.(png|jpe?g)$/
    );
    this.imagenes = req.keys().map((p: string) => p.replace('./', ''));
  }

  filteredImages(): string[] {
    if (!this.searchTerm) return this.imagenes;
    const t = this.searchTerm.toLowerCase();
    return this.imagenes.filter((n) => n.toLowerCase().includes(t));
  }

  // Un click: solo seleccionar (resalta)
  selectImage(img: string) {
    this.selectedImage = img;
  }

  // Doble click: devolver inmediatamente
  chooseImage(img: string) {
    this.modalCtrl.dismiss(img, 'ok');
  }

  // Botón "Usar esta imagen"
  useSelected() {
    if (this.selectedImage) {
      this.modalCtrl.dismiss(this.selectedImage, 'ok');
    }
  }

  // Botón "Cerrar"
  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
