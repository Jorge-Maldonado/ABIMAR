# Contexto del proyecto

## Qué es

**ABIMAR Shop** — tienda online de accesorios electrónicos (cargadores, audífonos, parlantes, etc.).
Paquete npm: `ecomm-app`. Cliente móvil/web con Ionic 5 + Angular 10.
El backend vive fuera de este repo: `https://backend-abimar.onrender.com/abimar/core/api`.
Deploy front en GitHub Pages: `https://jorge-maldonado.github.io/ABIMAR/` (`base-href /ABIMAR/`).

## Problema que resuelve

Permite a clientes explorar catálogo, armar carrito, registrar pedido y pagar (PayPal sandbox o QR bancario simulado), y a un administrador gestionar productos, categorías, usuarios, roles y pedidos.

## Usuarios

| Rol | Cómo se identifica hoy | Alcance |
|---|---|---|
| Cliente | login email/password → `localStorage` (`usuario`, `personal`) | catálogo, carrito, checkout, pedidos, perfil |
| Invitado | `guestAccess=true` vía `UtilService` | menú reducido; sin perfil/carrito/pedidos en el side menu |
| Admin | email hardcodeado `jorge.maldonado@hotmail.com` tras login | panel `/admin-home` (dashboard, roles, usuarios, categorías, productos, pedidos) |

UI en español. Moneda de catálogo en Bs; PayPal convierte/cobra en USD (sandbox).

## Alcance funcional

| Área | Páginas / rutas |
|---|---|
| Onboarding | `welcome`, `login`, `signup` |
| Tienda | `home`, `item-details`, `categoria-productos`, `favorite` |
| Compra | `my-cart`, `checkout`, `payment-methods`, `qr-payment`, `confirm` |
| Cuenta | `profile`, `my-orders`, `contactus` |
| Admin | `admin-home` + children: `dashboard`, `roles`, `usuarios`, `categorias`, `productos`, `pedidos` |
| Legado UI | `folder` (plantilla Ionic starter; no es dominio de negocio) |

## Stack

| Elemento | Valor |
|---|---|
| Framework UI | Ionic 5 (`@ionic/angular`) |
| Framework app | Angular ~10 |
| Lenguaje | TypeScript ~3.9 |
| HTTP | `HttpClientModule` |
| Estado local | `BehaviorSubject` + `localStorage` |
| Pagos | PayPal JS SDK (`client-id=sb`), QR vía `angularx-qrcode` |
| Nativo (Cordova) | splash-screen, status-bar, iOS platform declarado |
| Deploy | `ng build --prod` + `gh-pages` |

## Fuera de alcance de este repo

Backend Java/API en Render, lógica de verificación real de pago QR, y el workspace AI (`templates/`, `playbooks/`, Memory) más allá de Knowledge.

## Referencias

- [`../architecture/`](../architecture/) — capas e intención
- [`../modules/`](../modules/) — detalle por dominio
- [`../integrations/`](../integrations/) — backend y pagos
- `README.md` (raíz) — páginas UI originales y notas de prueba PayPal
