import { Component, OnInit } from '@angular/core';
import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { UtilService } from './util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  public isMenuEnabled = true;
  public showIcons = true;
  public selectedIndex = 0;
  public isGuest = false;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private util: UtilService,
    private router: Router,
    private menuCtrl: MenuController
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
    // Escucha el estado del menú
    this.util.getMenuState().subscribe(state => {
      this.isMenuEnabled = state;
      this.menuCtrl.enable(state); // 🔹 fuerza el estado en el controlador real
    });

    // Escucha el estado de los íconos
    this.util.getShowIcons().subscribe(state => {
      this.showIcons = state;
    });
    // inicializa estado desde localStorage
    const guest = localStorage.getItem('guestAccess') === 'true';
    this.util.setGuest(guest);
    // suscribirse para cambios en tiempo real
    this.util.isGuest$.subscribe(isGuest => {
      this.isGuest = isGuest;
      this.showIcons = !isGuest;     // desactiva iconos si es invitado
      this.menuCtrl.enable(true);     // siempre habilita menú lateral
    });
  }

  navigate(path: string, selectedId: number) {
    this.selectedIndex = selectedId;
    this.router.navigate([path]);
    this.menuCtrl.close();
  }

  close() {
    this.menuCtrl.close();
  }
}
