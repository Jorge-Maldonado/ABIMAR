# UI

## Descripción

Shell Ionic (`ion-split-pane` + `ion-menu` + `ion-router-outlet`) y páginas con templates HTML/SCSS por feature.

## Responsabilidad

| Pieza | Rol |
|---|---|
| `AppComponent` + `app.component.html` | menú lateral Abimar Shop; navegación a home/perfil/carrito/pedidos/contacto |
| Páginas `*.page.html/scss` | UI de cada ruta |
| `ImageSelectorComponent` | modal global para elegir imagen de producto |
| `LoaderService` | `LoadingController` con clase `custom-loader` |
| Toasts/Alerts | feedback puntual en pages (no hay design-system propio) |

## Menú cliente

- Siempre: Inicio, Contáctanos.
- Si no invitado: Mi Perfil, Mi Carrito, Mis Pedidos.
- Header del menú: “Invitado” o “Mi cuenta” + email/`userLabel`.
- Footer menú: **Cerrar sesión** (solo logueado). Cierre del menú con la X del header o al elegir una opción.
- Toolbar logout (`SessionService.logoutCliente`) en: home, perfil, pedidos, contactanos, categoría, detalle. **No** en carrito.
- Admin: logout en shell `AdminHomePage` (todas las hijas).

## Admin UI

`AdminHomePage` usa menú id `adminMenu` separado del menú cliente.

## Assets

- Categorías: `src/assets/categories/`
- Productos: `src/assets/products/`
- Fallback: `assets/no-image.png`
- Splash nativo (Cordova): `resources/splash.png` → densidades con `npm run android:splash` (mismas señales de marca que Welcome/Login: `#0B0B0D`, cyan `#00E5FF`, tagline “Tecnología al mejor precio”).

## Estado visual

Flags de menú/iconos vía `UtilService` (ver [`../architecture/navigation_state.md`](../architecture/navigation_state.md)). Login/signup deshabilitan menú al entrar.

## Referencias

- [`../modules/`](../modules/)
- [`../conventions/`](../conventions/)
