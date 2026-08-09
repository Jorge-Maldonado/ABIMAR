# Módulos

## Descripción

El código se organiza por **páginas Ionic** (carpeta = feature UI), no por features Flutter.
Agrupación lógica para la IA:

| Documento | Dominio |
|---|---|
| [`auth.md`](auth.md) | welcome, login, signup, sesión |
| [`storefront.md`](storefront.md) | home, detalle, categorías, favoritos |
| [`cart_checkout.md`](cart_checkout.md) | carrito, checkout, pagos, confirmación |
| [`admin.md`](admin.md) | panel admin CRUD y pedidos |
| [`account.md`](account.md) | perfil, mis pedidos, contacto |

## Dependencias entre áreas

- Storefront y cart dependen de `ApiService` / `CartService`.
- Checkout y pagos dependen de `PedidoService`.
- Admin reutiliza los mismos endpoints de catálogo/usuarios.
- Ningún área importa “otro feature” como módulo Angular; la composición es por rutas.

## Componentes transversales

| Pieza | Ubicación |
|---|---|
| `ApiService` | `services/api.service.ts` |
| `CartService` | `services/cart.service.ts` |
| `PedidoService` | `services/pedido.service.ts` |
| `UtilService` | `util.service.ts` |
| `LoaderService` | `services/ui/loader.service.ts` |
| `ImageSelectorComponent` | `components/image-selector/` (declarado en `AppModule`) |
| `DataService` | `data.service.ts` (legado estático) |

## Referencias

- [`../architecture/`](../architecture/)
- [`../integrations/`](../integrations/)
- CodeGraph para el árbol exacto de cada página
