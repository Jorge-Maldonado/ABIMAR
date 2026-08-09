# Dependencias

## Descripción

Criterio sobre librerías del `package.json` relevantes al dominio. No es un dump de todo el lockfile.

## Runtime principal

| Paquete | Por qué está |
|---|---|
| `@angular/*` ~10 | framework de la app |
| `@ionic/angular` ^5 | UI y navegación móvil/web |
| `rxjs` ~6.5 | streams (`BehaviorSubject`, `forkJoin`) |
| `@angular/common/http` | HTTP (vía Angular common) |
| `zone.js` | change detection Angular |

## Pagos y QR

| Paquete | Por qué está |
|---|---|
| `@paypal/paypal-js` | integración PayPal (además del script CDN en page) |
| `angularx-qrcode` | componente QR en `QrPaymentPage` |
| `ngx-qrcode2` | legado/alternativo; el flujo activo usa `angularx-qrcode` |

## Cordova / nativo

| Paquete | Por qué está |
|---|---|
| `@ionic-native/splash-screen` | splash al boot |
| `@ionic-native/status-bar` | barra de estado |
| `cordova-ios` + plugins | empaquetado iOS declarado |

## Tooling

| Paquete | Por qué está |
|---|---|
| `@angular/cli` 10 | build/serve |
| `gh-pages` | deploy a GitHub Pages |
| Karma/Jasmine/Protractor | tests unitarios/e2e de plantilla |
| `typescript` ~3.9 | lenguaje (pareja de Angular 10) |

## Notas operativas

- Scripts `start`/`build` usan `NODE_OPTIONS=--openssl-legacy-provider` (Node moderno + toolchain Angular 10).
- Stack antiguo: al añadir librerías, verificar compatibilidad con Angular 10 / Ionic 5.

## Referencias

- [`../context/`](../context/)
- [`../integrations/`](../integrations/)
- `package.json` (fuente de versiones exactas)
