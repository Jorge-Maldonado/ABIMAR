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

Este repo **no** contiene el código del backend.

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

Plugins declarados: whitelist, statusbar, device, splashscreen, ionic-webview, ionic-keyboard. Plataforma iOS en `package.json`. El deploy principal documentado es web/GitHub Pages.

## Referencias

- [`../architecture/network.md`](../architecture/network.md)
- [`../modules/cart_checkout.md`](../modules/cart_checkout.md)
- [`../dependencies/`](../dependencies/)
