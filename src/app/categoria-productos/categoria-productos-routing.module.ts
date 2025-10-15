import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CategoriaProductosPage } from './categoria-productos.page';

const routes: Routes = [
  {
    path: '',
    component: CategoriaProductosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoriaProductosPageRoutingModule {}
