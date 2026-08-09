# Storefront

## Descripción

Experiencia de catálogo para el cliente.

## Responsabilidad

| Página | Hace |
|---|---|
| `HomePage` | categorías + productos; destacados/más vendidos = slices locales; búsqueda; add to cart |
| `ItemDetailsPage` | detalle recibido por `queryParams.producto` (JSON) |
| `CategoriaProductosPage` | productos filtrados por `categoriaId` (Number); carrito/favoritos; detalle |
| `FavoritePage` | favoritos (UI; persistencia limitada / toast en home) |

## Componentes / servicios

- `ApiService` → `/categoria/list`, `/producto/list`.
- `CartService.add` desde home/detalle.
- Normalización de imágenes a `assets/products/...` o URL absoluta.

## Dependencias

- No depende de admin pages.
- `DataService` no alimenta el home actual (legado).

## Particularidades

- El producto viaja serializado en query params hacia `item-details`.
- Destacados/más vendidos no vienen de endpoints dedicados: `slice(0,5)` y `slice(5,10)`.
- Sección **Productos** en home lista el catálogo activo completo (`status === 1`) con “Ver todos”.

## Referencias

- [`cart_checkout.md`](cart_checkout.md)
- [`../architecture/network.md`](../architecture/network.md)
- [`../ui/`](../ui/)
