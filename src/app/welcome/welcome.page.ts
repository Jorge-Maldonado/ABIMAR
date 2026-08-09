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
    this.menu.enable(false, 'mainMenu');
    this.util.setMenuState(false);
    this.util.setShowIcons(false);
  }

  ionViewWillLeave() {

  }

  goHomeWithoutLogin() {
    localStorage.setItem('guestAccess', 'true');
    this.util.setMenuState(true);
    this.isGuest = true;
    this.menu.enable(true, 'mainMenu');
    this.util.setShowIcons(false);
    this.util.setGuest(true);
    this.router.navigate(['/home']);
  }
}
