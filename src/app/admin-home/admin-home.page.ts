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
}
