# Cuenta y contacto

## Descripción

Páginas de cuenta del cliente y contacto.

## Responsabilidad

| Página | Hace |
|---|---|
| `ProfilePage` | perfil vía `usuario/list` + `persona/list` (`ApiService.url`); accesos y logout |
| `MyOrdersPage` | pedidos del cliente; detalle con imagen vía catálogo `producto/list`; WhatsApp entrega |
| `ContactusPage` | formulario → `ContactoService.crear` (`/contacto/create`); canales WhatsApp/mail |

Visibles en el side menu solo si `!isGuest`.

## Dependencias

- Sesión en `localStorage` (`usuario`, `personal`).
- Menú controlado por `AppComponent` + `UtilService`.
- `ContactoService` → `/contacto/create` (payload: `nombre`, `correo`, `telefono`, `mensaje`, `fecha`, `estado: 1`).

## Referencias

- [`auth.md`](auth.md)
- [`../ui/`](../ui/)
- [`../architecture/navigation_state.md`](../architecture/navigation_state.md)
