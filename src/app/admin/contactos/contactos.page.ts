import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ContactoService } from '../../services/contacto.service';

@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.page.html',
  styleUrls: ['./contactos.page.scss'],
})
export class ContactosPage implements OnInit {
  contactos: any[] = [];
  seleccionado: any = null;

  searchTerm = '';
  filtroEstado: 'ALL' | 'NUEVO' | 'ATENDIDO' = 'ALL';

  loading = false;
  saving = false;

  constructor(
    private contactoService: ContactoService,
    private toastCtrl: ToastController,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargar();
  }

  get countAll(): number {
    return this.contactos.length;
  }

  get countNuevos(): number {
    return this.contactos.filter(c => this.esNuevo(c)).length;
  }

  get countAtendidos(): number {
    return this.contactos.filter(c => !this.esNuevo(c)).length;
  }

  cargar(event?: any) {
    if (!event) {
      this.loading = true;
      this.cd.markForCheck();
    }

    this.contactoService.listar().subscribe({
      next: (res) => {
        const lista = Array.isArray(res) ? res : [];
        this.contactos = lista.sort((a, b) => {
          const fa = new Date(a.fecha || 0).getTime();
          const fb = new Date(b.fecha || 0).getTime();
          return fb - fa;
        });
        this.loading = false;
        if (event) {
          event.target.complete();
        }

        if (this.seleccionado) {
          const updated = this.contactos.find(
            c => c.idcontacto === this.seleccionado.idcontacto
          );
          this.seleccionado = updated ? { ...updated } : null;
        }

        this.cd.markForCheck();
      },
      error: async () => {
        this.contactos = [];
        this.loading = false;
        if (event) {
          event.target.complete();
        }
        this.cd.markForCheck();
        await this.showToast('No se pudieron cargar los mensajes', 'danger');
      }
    });
  }

  setFiltroEstado(mode: 'ALL' | 'NUEVO' | 'ATENDIDO') {
    this.filtroEstado = mode;
    this.cd.markForCheck();
  }

  onSearchChange() {
    this.cd.markForCheck();
  }

  contactosFiltrados(): any[] {
    let lista = [...this.contactos];

    if (this.filtroEstado === 'NUEVO') {
      lista = lista.filter(c => this.esNuevo(c));
    } else if (this.filtroEstado === 'ATENDIDO') {
      lista = lista.filter(c => !this.esNuevo(c));
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      lista = lista.filter(c =>
        String(c.idcontacto || '').includes(term) ||
        (c.nombre || '').toLowerCase().includes(term) ||
        (c.correo || '').toLowerCase().includes(term) ||
        (c.telefono || '').toLowerCase().includes(term) ||
        (c.mensaje || '').toLowerCase().includes(term)
      );
    }

    return lista;
  }

  trackByContacto(_i: number, item: any) {
    return item.idcontacto;
  }

  esNuevo(c: any): boolean {
    return Number(c?.estado) === 1;
  }

  seleccionar(c: any) {
    this.seleccionado = { ...c };
    this.cd.markForCheck();
  }

  cerrarDetalle() {
    this.seleccionado = null;
    this.cd.markForCheck();
  }

  async marcarAtendido(c: any) {
    if (!c || this.saving || !this.esNuevo(c)) {
      return;
    }

    this.saving = true;
    const payload = {
      idcontacto: c.idcontacto,
      nombre: c.nombre || '',
      correo: c.correo || '',
      telefono: c.telefono || '',
      mensaje: c.mensaje || '',
      fecha: c.fecha || new Date().toISOString(),
      estado: 0
    };

    this.contactoService.actualizar(payload).subscribe({
      next: async () => {
        this.saving = false;
        await this.showToast('Mensaje marcado como atendido', 'success');
        this.cargar();
      },
      error: async (err) => {
        console.error('Error actualizando contacto:', err);
        this.saving = false;
        await this.showToast('No se pudo actualizar el estado', 'danger');
      }
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}
