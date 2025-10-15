import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(private menu: MenuController) { }

  ngOnInit() {}

  ionViewWillEnter() {
    // Deshabilita el menú lateral al entrar en Welcome
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    // Vuelve a habilitar el menú al salir de Welcome
    this.menu.enable(true);
  }

}
