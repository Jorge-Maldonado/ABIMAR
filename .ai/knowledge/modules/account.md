# Cuenta y contacto

## Descripción

Páginas de cuenta del cliente y contacto.

## Responsabilidad

| Página | Hace |
|---|---|
| `ProfilePage` | perfil del usuario logueado |
| `MyOrdersPage` | pedidos del cliente (vía API / personal) |
| `ContactusPage` | formulario / info de contacto |

Visibles en el side menu solo si `!isGuest`.

## Dependencias

- Sesión en `localStorage` (`usuario`, `personal`).
- Menú controlado por `AppComponent` + `UtilService`.

## Referencias

- [`auth.md`](auth.md)
- [`../ui/`](../ui/)
- [`../architecture/navigation_state.md`](../architecture/navigation_state.md)
