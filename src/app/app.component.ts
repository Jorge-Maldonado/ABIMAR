import { Component, OnInit } from '@angular/core';
import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { UtilService } from './util.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  static readonly MENU_ID = 'mainMenu';

  /** Rutas donde el menú no debe abrirse solo (compra, auth, admin). */
  private static readonly MENU_FOCUS_ROUTES = [
    '/admin-home',
    '/checkout',
    '/payment-methods',
    '/qr-payment',
    '/confirm',
    '/item-details',
    '/login',
    '/signup',
    '/welcome',
  ];

  public isMenuEnabled = true;
  public showIcons = true;
  public selectedIndex = 0;
  public isGuest = false;
  public userLabel = 'Abimar Shop';
  public swipeEnabled = true;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private util: UtilService,
    private router: Router,
    private menuCtrl: MenuController,
    private session: SessionService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    this.refreshUserLabel();

    this.util.getMenuState().subscribe(state => {
      this.isMenuEnabled = state;
      this.menuCtrl.enable(state, AppComponent.MENU_ID);
    });

    this.util.getShowIcons().subscribe(state => {
      this.showIcons = state;
    });

    const guest = localStorage.getItem('guestAccess') === 'true';
    this.util.setGuest(guest);

    this.util.isGuest$.subscribe(isGuest => {
      this.isGuest = isGuest;
      this.showIcons = !isGuest;
      this.refreshUserLabel();
    });

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = e.urlAfterRedirects || e.url;
        this.refreshUserLabel();
        this.syncSelectedIndex(url);
        this.syncMenuForUrl(url);
      });
  }

  private isFocusRoute(url: string): boolean {
    const path = (url || '').split('?')[0];
    return AppComponent.MENU_FOCUS_ROUTES.some(
      (r) => path === r || path.startsWith(r + '/')
    );
  }

  private async syncMenuForUrl(url: string) {
    // Admin: menú cliente off
    if (url.includes('/admin-home')) {
      this.swipeEnabled = false;
      this.util.setMenuState(false);
      await this.menuCtrl.enable(false, AppComponent.MENU_ID);
      await this.menuCtrl.close(AppComponent.MENU_ID);
      return;
    }

    // Flujo de compra / auth: nunca auto-abrir ni swipe
    if (this.isFocusRoute(url)) {
      this.swipeEnabled = false;
      await this.menuCtrl.close(AppComponent.MENU_ID);
      return;
    }

    // Rutas normales de tienda: menú disponible, cerrado
    this.swipeEnabled = true;
    await this.menuCtrl.close(AppComponent.MENU_ID);
  }

  private refreshUserLabel() {
    const usuario = (localStorage.getItem('usuario') || '').trim();
    if (this.isGuest || !usuario) {
      this.userLabel = 'Navegación libre';
    } else {
      this.userLabel = usuario;
    }
  }

  private syncSelectedIndex(url: string) {
    if (url.startsWith('/home')) this.selectedIndex = 1;
    else if (url.startsWith('/profile')) this.selectedIndex = 2;
    else if (url.startsWith('/my-cart')) this.selectedIndex = 3;
    else if (url.startsWith('/my-orders')) this.selectedIndex = 5;
    else if (url.startsWith('/contactus')) this.selectedIndex = 7;
  }

  async navigate(path: string, selectedId: number, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selectedIndex = selectedId;
    await this.router.navigateByUrl(path);
    // Cerrar tras elegir sección (no mantener abierto en navegaciones posteriores)
    await this.menuCtrl.close(AppComponent.MENU_ID);
  }

  async closeMenu(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    await this.menuCtrl.close(AppComponent.MENU_ID);
  }

  async logout(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    await this.menuCtrl.close(AppComponent.MENU_ID);
    await this.session.logoutCliente();
  }
}
