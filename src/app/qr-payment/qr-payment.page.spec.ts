import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QrPaymentPage } from './qr-payment.page';

describe('QrPaymentPage', () => {
  let component: QrPaymentPage;
  let fixture: ComponentFixture<QrPaymentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QrPaymentPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(QrPaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
