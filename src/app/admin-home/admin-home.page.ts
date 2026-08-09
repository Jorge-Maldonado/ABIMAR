import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
})
export class AdminHomePage implements OnDestroy {
  static readonly MENU_ID = 'adminMenu';

  selected = 'dashboard';
  private navSub?: Subscription;

  constructor(
    private router: Router,
    private menu: MenuController,
    private util: UtilService
  ) {}

  async ionViewWillEnter() {
    // El menú cliente usa el mismo contentId histórico; en admin debe quedar fuera
    this.util.setMenuState(false);
    await this.menu.enable(false, 'mainMenu');
    await this.menu.close('mainMenu');
    await this.menu.enable(true, AdminHomePage.MENU_ID);

    this.syncSelected(this.router.url);
    if (!this.navSub) {
      this.navSub = this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe((e) => this.syncSelected(e.urlAfterRedirects || e.url));
    }
  }

  async ionViewWillLeave() {
    await this.menu.close(AdminHomePage.MENU_ID);
    await this.menu.enable(false, AdminHomePage.MENU_ID);
  }

  ngOnDestroy() {
    this.navSub?.unsubscribe();
  }

  private syncSelected(url: string) {
    const path = (url || '').split('?')[0];
    if (path.includes('/roles')) this.selected = 'roles';
    else if (path.includes('/usuarios')) this.selected = 'usuarios';
    else if (path.includes('/categorias')) this.selected = 'categorias';
    else if (path.includes('/productos')) this.selected = 'productos';
    else if (path.includes('/pedidos')) this.selected = 'pedidos';
    else this.selected = 'dashboard';
  }

  async go(segment: string, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selected = segment;
    await this.router.navigate(['/admin-home', segment]);
    await this.menu.close(AdminHomePage.MENU_ID);
  }

  async closeMenu(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    await this.menu.close(AdminHomePage.MENU_ID);
  }

  async logout() {
    localStorage.clear();
    await this.menu.close(AdminHomePage.MENU_ID);
    await this.menu.enable(false, AdminHomePage.MENU_ID);
    this.util.setMenuState(false);
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
