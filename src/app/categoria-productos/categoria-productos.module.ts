import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoriaProductosPageRoutingModule } from './categoria-productos-routing.module';

import { CategoriaProductosPage } from './categoria-productos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoriaProductosPageRoutingModule
  ],
  declarations: [CategoriaProductosPage]
})
export class CategoriaProductosPageModule {}
