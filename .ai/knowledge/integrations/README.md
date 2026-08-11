# Integraciones

## Descripción

Servicios externos y backend consumidos por el front.

## Backend ABIMAR

| Campo | Valor |
|---|---|
| Host | `https://backend-abimar.onrender.com` |
| Prefijo API | `/abimar/core/api` |
| Config front | `environment.apiBase` |
| Hosting | Render (posible cold start) |

Dominios REST usados: login, persona, usuario, rol, categoria, producto, pedido, detallepedido.
Contrato típico: POST con body JSON; listados devuelven arrays.

Este repo **no** contiene el código del backend (está en `backend-abimar-master`).

CORS (tras redeploy): orígenes web + Cordova (`http://localhost`, `ionic://localhost`, GitHub Pages). Ver [`android_apk.md`](./android_apk.md).

## PayPal

| Campo | Valor |
|---|---|
| SDK | script `https://www.paypal.com/sdk/js?client-id=sb&currency=USD` |
| Paquete npm | `@paypal/paypal-js` (también hay carga por script tag en page) |
| Modo | Sandbox (`sb`) |
| UI | `PaymentMethodsPage` renderiza `paypal.Buttons` en `#paypal-button-container` |

Conversión ad-hoc: total local `/ 9` antes de cobrar en USD.

## QR de pago

| Campo | Valor |
|---|---|
| Librería | `angularx-qrcode` (`QRCodeModule`) |
| Contenido | texto local con monto en Bs (no payload bancario real) |
| Confirmación | relectura del pedido en backend hasta `PAGADO` |

## Cordova / nativo

Plugins: whitelist, statusbar, device, splashscreen, ionic-webview, ionic-keyboard, **file**, **x-socialsharing** (QR en APK).  
`config.xml`: id `com.abimar.shop`, content `index.html` (no live-reload).  
Guía APK: [`android_apk.md`](./android_apk.md).

## Referencias

- [`android_apk.md`](./android_apk.md)
- [`../architecture/network.md`](../architecture/network.md)
- [`../modules/cart_checkout.md`](../modules/cart_checkout.md)
- [`../dependencies/`](../dependencies/)
