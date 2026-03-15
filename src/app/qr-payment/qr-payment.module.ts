import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QrPaymentPageRoutingModule } from './qr-payment-routing.module';

import { QrPaymentPage } from './qr-payment.page';

import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrPaymentPageRoutingModule,
    QRCodeModule   // 👈 agrega este módulo aquí
  ],
  declarations: [QrPaymentPage]
})
export class QrPaymentPageModule {}
