# Glosario

## Negocio

| Término | Significado |
|---|---|
| ABIMAR / Abimar Shop | Nombre comercial de la tienda |
| Categoría | Agrupación de productos (`idcategoria`) |
| Producto | Ítem vendible (`idproducto`, precio, stock, imagen) |
| Pedido | Orden de compra (`idpedido`, `status`, `monto`, `tipoPagoId`) |
| Detalle pedido | Línea de pedido (`productoId`, `cantidad`, `subtotal`) |
| Persona | Datos civiles del usuario (`idpersona`, documento, rolId) |
| Usuario (login) | Credenciales (`emailUser`, `password`, `personal` → persona) |
| Rol | Perfil en backend; el front admin lo CRUD-ea |
| Invitado | Navegación sin cuenta (`guestAccess`) |

## Estados de pedido

| Valor | Uso |
|---|---|
| `PENDIENTE` | Creado, pago no confirmado |
| `PAGADO` | Pago aceptado (PayPal/QR/admin) |
| `CANCELADO` | Anulado |

## Código

| Término | Significado |
|---|---|
| `apiBase` | Prefijo HTTP en `environment` |
| `CartService` | Estado reactivo del carrito |
| `UtilService` | Flags de shell (menú, iconos, guest) |
| `personal` | Id de persona en sesión / pedido |
| `tipoPagoId` | 1 PayPal, 2 QR |
| PageModule | NgModule lazy de una página Ionic |
| `DataService` | Catálogo estático legado de la plantilla |

## Referencias

- [`../context/`](../context/)
- [`../modules/`](../modules/)
