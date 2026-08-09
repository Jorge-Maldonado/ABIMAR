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
- Header del menú: “Invitado” o “Mi cuenta” + “Abimar Shop”.

## Admin UI

`AdminHomePage` usa menú id `adminMenu` separado del menú cliente.

## Assets

- Categorías: `src/assets/categories/`
- Productos: `src/assets/products/`
- Fallback: `assets/no-image.png`

## Estado visual

Flags de menú/iconos vía `UtilService` (ver [`../architecture/navigation_state.md`](../architecture/navigation_state.md)). Login/signup deshabilitan menú al entrar.

## Referencias

- [`../modules/`](../modules/)
- [`../conventions/`](../conventions/)
