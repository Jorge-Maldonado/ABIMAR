# Navegación y estado de UI

## Descripción

Routing Angular con lazy `loadChildren` + estado de shell vía `UtilService` y `localStorage`.

## Responsabilidad

### Rutas raíz (`AppRoutingModule`)

Redirect `''` → `welcome`. Rutas lazy: `welcome`, `login`, `signup`, `home`, `item-details`, `my-cart`, `profile`, `my-orders`, `favorite`, `checkout`, `confirm`, `admin-home`, `categoria-productos`, `contactus`, `payment-methods`, `qr-payment`, `pedidos`, `folder`.

Preload: `PreloadAllModules`.

### Admin anidado (`AdminHomePageRoutingModule`)

`/admin-home` con children: `dashboard`, `roles`, `usuarios`, `categorias`, `productos`, `pedidos` (default → `dashboard`).

### Estado de shell (`UtilService`)

| Flag | Efecto |
|---|---|
| `menuState$` | habilita/deshabilita `ion-menu` |
| `showIcons$` | iconos de cabecera |
| `isGuest$` | oculta ítems de menú (perfil, carrito, pedidos) y persiste `guestAccess` |

`AppComponent` se suscribe a esos streams. Al elegir un ítem del menú **cierra** el overlay (no lo reabre en navegaciones posteriores). En rutas de compra/auth (`item-details`, `checkout`, `payment-methods`, `qr-payment`, `confirm`, login/signup/welcome) y admin, el menú se fuerza cerrado y el swipe queda desactivado.

### Estado de sesión / compra (no es store global)

| Clave `localStorage` | Uso |
|---|---|
| `usuario` | email logueado |
| `personal` | id persona del login |
| `guestAccess` | modo invitado |
| `carrito` | JSON del carrito (`CartService`) |
| `pedidoId` | pedido en flujo de pago |
| `totalPedido` | auxiliar de checkout (hoy guarda envío) |

No hay NgRx/Akita. El carrito es la única pieza reactiva de dominio (`BehaviorSubject`).

## Flujo de navegación típico

`welcome` → `login`/`signup` → `home` (cliente) o `admin-home` (admin) → `item-details` → `my-cart` → `checkout` → `payment-methods` → (`qr-payment` \| PayPal) → `confirm`.

## Referencias

- [`README.md`](README.md)
- [`../ui/`](../ui/)
- [`../security/`](../security/)
- [`../modules/cart_checkout.md`](../modules/cart_checkout.md)
