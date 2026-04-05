import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
})
export class AdminHomePage {
  constructor(private router: Router, private menu: MenuController) {}

  async go(segment: string) {
    await this.router.navigate(['/admin-home', segment]);
    await this.menu.close('adminMenu');
  }

  logout() {
  // 🔹 1. Limpiar sesión
  localStorage.clear(); // o removeItem('token') si usas JWT

  // 🔹 2. Cerrar menú (UX limpia)
  this.menu.close('adminMenu');

  // 🔹 3. Redirigir a login
  this.router.navigateByUrl('/login', { replaceUrl: true });
}
}





