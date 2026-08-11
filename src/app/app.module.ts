import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File } from '@ionic-native/file/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

// 🔹 FormsModule para que funcione [(ngModel)]
import { FormsModule } from '@angular/forms';

// 🔹 Importa el componente del selector de imágenes
import { ImageSelectorComponent } from './components/image-selector/image-selector.component';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    AppComponent,
    ImageSelectorComponent,   // <-- declarado aquí
  ],
  entryComponents: [
    ImageSelectorComponent   // <-- necesario para usarlo en modal
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,              // <-- agregado aquí
    QRCodeModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SocialSharing,
    File,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
