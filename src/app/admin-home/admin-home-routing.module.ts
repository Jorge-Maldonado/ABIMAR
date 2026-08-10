import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminHomePage } from './admin-home.page';

const routes: Routes = [
  {
    path: '',
    component: AdminHomePage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'roles',
        loadChildren: () => import('../roles/roles.module').then(m => m.RolesPageModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('../usuarios/usuarios.module').then(m => m.UsuariosPageModule)
      },
      {
        path: 'categorias',
        loadChildren: () => import('../categorias/categorias.module').then(m => m.CategoriasPageModule)
      },
      {
        path: 'productos',
        loadChildren: () => import('../productos/productos.module').then(m => m.ProductosPageModule)
      },
      {
        path: 'pedidos',
        loadChildren: () => import('../admin/pedidos/pedidos.module').then(m => m.PedidosPageModule)
      },
      {
        path: 'contactos',
        loadChildren: () => import('../admin/contactos/contactos.module').then(m => m.ContactosPageModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminHomePageRoutingModule { }
