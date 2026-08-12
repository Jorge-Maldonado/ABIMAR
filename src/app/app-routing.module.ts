import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then(m => m.FolderPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'item-details',
    loadChildren: () => import('./item-details/item-details.module').then(m => m.ItemDetailsPageModule)
  },
  {
    path: 'my-cart',
    loadChildren: () => import('./my-cart/my-cart.module').then(m => m.MyCartPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'my-orders',
    loadChildren: () => import('./my-orders/my-orders.module').then(m => m.MyOrdersPageModule)
  },
  {
    path: 'favorite',
    loadChildren: () => import('./favorite/favorite.module').then(m => m.FavoritePageModule)
  },
  {
    path: 'checkout',
    loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutPageModule)
  },
  {
    path: 'confirm',
    loadChildren: () => import('./confirm/confirm.module').then(m => m.ConfirmPageModule)
  },

  // 🔹 Administración
  {
    path: 'admin-home',
    loadChildren: () => import('./admin-home/admin-home.module').then(m => m.AdminHomePageModule)
  },  {
    path: 'categoria-productos',
    loadChildren: () => import('./categoria-productos/categoria-productos.module').then( m => m.CategoriaProductosPageModule)
  },
  {
    path: 'contactus',
    loadChildren: () => import('./contactus/contactus.module').then( m => m.ContactusPageModule)
  },
  {
    path: 'payment-methods',
    loadChildren: () => import('./payment-methods/payment-methods.module').then( m => m.PaymentMethodsPageModule)
  },
  {
    path: 'qr-payment',
    loadChildren: () => import('./qr-payment/qr-payment.module').then( m => m.QrPaymentPageModule)
  },
  {
    path: 'pedidos',
    loadChildren: () => import('./admin/pedidos/pedidos.module').then( m => m.PedidosPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
