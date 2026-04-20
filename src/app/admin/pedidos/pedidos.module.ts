import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular'; // 🔥 CLAVE

import { PedidosPageRoutingModule } from './pedidos-routing.module';
import { PedidosPage } from './pedidos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule, // 🔥 ESTO SOLUCIONA ion-modal, ion-button, etc.
    PedidosPageRoutingModule
  ],
  declarations: [PedidosPage]
})
export class PedidosPageModule {}