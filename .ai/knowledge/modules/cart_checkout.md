# Carrito y checkout

## Descripción

Flujo de compra: carrito local → pedido en backend → métodos de pago → confirmación.

## Responsabilidad

| Página / service | Hace |
|---|---|
| `MyCartPage` | UI del carrito vía `CartService` |
| `CheckoutPage` | resumen; `registrarPedido()` crea pedido+detalles y navega a pago; `confirmarCompra()` variante que limpia carrito |
| `PaymentMethodsPage` | PayPal sandbox + enlace a QR |
| `QrPaymentPage` | muestra QR (`angularx-qrcode`); `confirmarPago` re-lee pedido y exige `status === 'PAGADO'` |
| `ConfirmPage` | pantalla final con método/total por query params |
| `CartService` | CRUD carrito, total, persistencia `carrito` |
| `PedidoService` | create/list/read/update pedido y detalle |

## Flujo canónico

1. `CartService` mantiene ítems (`idproducto` normalizado, `cantidad`, `precio`, `options`).
2. `CheckoutPage.registrarPedido` envía pedido `PENDIENTE` (`personal: 1` hardcodeado hoy, dirección fija Santa Cruz).
3. Crea `detallepedido` por ítem con `forkJoin`.
4. Navega a `/payment-methods?pedidoId=...`.
5. PayPal: SDK `client-id=sb`, convierte total `/9` a USD; onApprove → `updatePedido` a `PAGADO`.
6. QR: texto `Pago QR - Monto: X Bs`; confirmación polling manual del estado en backend.

## Estados de pedido

`PENDIENTE` | `PAGADO` | `CANCELADO`

## Métodos de pago (`tipoPagoId`)

| Código | Significado en UI admin |
|---|---|
| 1 | PayPal |
| 2 | QR |

## Particularidades / riesgos

- `personal` del pedido se toma de `localStorage.personal` en checkout.
- PayPal cobra en USD (`montoBs / 9`); el pedido y la confirmación guardan/muestran el monto en **Bs**.
- Tras PayPal se actualiza `status=PAGADO`, `tipoPagoId=1` y datos de transacción; una sola navegación a `/confirm`.
- `totalPedido` en `localStorage` guarda el total en Bs (no el envío).

## Referencias

- [`../integrations/`](../integrations/)
- [`admin.md`](admin.md) — gestión de pedidos
- [`../architecture/navigation_state.md`](../architecture/navigation_state.md)
