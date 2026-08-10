# Storefront

## Descripción

Experiencia de catálogo para el cliente.

## Responsabilidad

| Página | Hace |
|---|---|
| `HomePage` | categorías + productos; destacados/más vendidos por flags `destacado`/`masVendido`; búsqueda; add to cart |
| `ItemDetailsPage` | detalle por `queryParams.producto`; qty, stock, favoritos, carrito |
| `CategoriaProductosPage` | productos filtrados por `categoriaId` (Number); carrito/favoritos; detalle |
| `FavoritePage` | favoritos (UI; persistencia limitada / toast en home) |

## Componentes / servicios

- `ApiService` → `/categoria/list`, `/producto/list`.
- `FavoritesService`: favoritos por usuario en `localStorage` clave `favoritos:{email}`; se recarga en login/home; logout limpia la sesión en memoria (no borra la lista guardada del usuario).
- `CartService.add` desde home/detalle.
- Normalización de imágenes a `assets/products/...` o URL absoluta.

## Dependencias

- No depende de admin pages.
- `DataService` no alimenta el home actual (legado).

## Particularidades

- El producto viaja serializado en query params hacia `item-details`.
- Destacados/más vendidos: filtrado cliente desde `/producto/list` con `status === 1` y `destacado` / `masVendido` (boolean o 0/1).
- `HomePage` recarga categorías y productos en `ionViewWillEnter` (Ionic reutiliza la página tras login).
- Sección **Productos** en home lista el catálogo activo completo (`status === 1`) con “Ver todos”.

## Referencias

- [`cart_checkout.md`](cart_checkout.md)
- [`../architecture/network.md`](../architecture/network.md)
- [`../ui/`](../ui/)
