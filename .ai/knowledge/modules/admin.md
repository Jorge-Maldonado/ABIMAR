# Admin

## Descripción

Panel de administración bajo `/admin-home` con menú propio (`adminMenu`).

## Responsabilidad

| Ruta hija | Página | Hace |
|---|---|---|
| `dashboard` | `DashboardPage` | resumen admin |
| `roles` | `RolesPage` | CRUD roles |
| `usuarios` | `UsuariosPage` | personas + logins combinados; CRUD |
| `categorias` | `CategoriasPage` | CRUD categorías |
| `productos` | `ProductosPage` | CRUD productos: stats, filtros categoría/stock, selector imagen, toasts/confirm |
| `pedidos` | `PedidosPage` | listar/filtrar (estado+pago), panel detalle lateral, cambiar estado + toasts |

Shell: `AdminHomePage` navega a children y hace `logout` con `localStorage.clear()`.

## Componentes

- `ApiService` para roles/usuarios/categorías/productos.
- `PedidoService` para pedidos.
- `ImageSelectorComponent` (modal) al editar imagen de producto.

## Dependencias

- Acceso previsto solo tras login admin; **sin AuthGuard**.
- Comparte backend con la tienda.

## Particularidades

- Layout admin compartido: contenedor `max-width: 1600px`, y en CRUD con form (Usuarios/Productos/Categorías) grid `380px 1fr` (form sticky + listado).
- `UsuariosPage` une `/persona/list` + `/usuario/list` por `personal` ↔ `idpersona`.
- Al crear usuario desde admin hay llamadas duplicadas a `/usuario/create` (persona y login) — revisar al tocar ese flujo.
- Pedidos: colores/iconos por status; método pago 1=PayPal, 2=QR.

## Referencias

- [`auth.md`](auth.md)
- [`cart_checkout.md`](cart_checkout.md)
- [`../security/`](../security/)
