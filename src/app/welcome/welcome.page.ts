import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {
  isGuest: boolean = false;
  constructor(
    private menu: MenuController,
    private router: Router,
    private util: UtilService
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.menu.enable(false);
    this.util.setMenuState(false);
    this.util.setShowIcons(false);
  }

  ionViewWillLeave() {

  }

  goHomeWithoutLogin() {
    localStorage.setItem('guestAccess', 'true');
    this.util.setMenuState(true);
    localStorage.setItem('guestAccess', 'true'); // persistente
    this.isGuest = true;                         // control de UI
    this.menu.enable(true);            // 🔹 también habilita el físico
    this.util.setShowIcons(false); // ❌ sin notificaciones ni filtro
    this.util.setGuest(true);
    this.router.navigate(['/home']);
  }
}
