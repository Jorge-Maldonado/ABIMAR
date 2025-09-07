const routes: Routes = [
  {
    path: '',
    component: AdminHomePage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('../roles/roles.module').then(m => m.RolesPageModule)
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('../usuarios/usuarios.module').then(m => m.UsuariosPageModule)
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('../categorias/categorias.module').then(m => m.CategoriasPageModule)
      },
      {
        path: 'productos',
        loadChildren: () =>
          import('../productos/productos.module').then(m => m.ProductosPageModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
