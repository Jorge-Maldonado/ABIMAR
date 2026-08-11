# Carrito y checkout

## Descripción

Flujo de compra: carrito local → pedido en backend → métodos de pago → confirmación.

## Responsabilidad

| Página / service | Hace |
|---|---|
| `MyCartPage` | UI del carrito vía `CartService`; qty llamativa; CTA **Pagar ahora** → checkout |
| `CheckoutPage` | resumen; `registrarPedido()` crea pedido+detalles y navega a pago; `confirmarCompra()` variante que limpia carrito |
| `PaymentMethodsPage` | resumen pedido; PayPal sandbox + QR; panel PayPal expandible; empty state |
| `QrPaymentPage` | QR estático `assets/qr/qr.jpg`; monto/pedido, copiar, pasos; descarga web con `<a download>`; en **APK** guarda con File plugin (fallback share) + botón **Compartir QR** solo Cordova; `confirmarPago` exige `status === 'PAGADO'` |
| `ConfirmPage` | resumen final; aviso de entrega por WhatsApp + CTA `wa.me` |
| `CartService` | CRUD carrito por `personal` (`carrito:{personalId}`); total; sync en login/home |
| `PedidoService` | create/list/read/update pedido y detalle |

## Flujo canónico

1. `CartService` mantiene ítems por usuario (`idproducto` normalizado, `cantidad`, `precio`, `options`); clave `carrito:{personal}`.
2. `CheckoutPage.registrarPedido` crea pedido `PENDIENTE` con `referenciaCobro` = código único `ABI-…` y `personal` del cliente.
3. Crea `detallepedido` por ítem con `forkJoin`.
4. Navega a `/payment-methods?pedidoId=...&codigo=ABI-…`.
5. PayPal: SDK `client-id=sb`, convierte total `/9` a USD; onApprove → `updatePedido` a `PAGADO`.
6. QR: al entrar setea `tipoPagoId=2`; imagen de comercio + monto; “Ya pagué” re-lee hasta `PAGADO`.

## Código de pedido

- Público: `referenciaCobro` formato `ABI-XXXXXXXXXX` (generado en checkout).
- Interno: `idpedido` (solo admin como referencia técnica).
- WhatsApp y pantallas cliente muestran el código `ABI-…`, no `#17`.

## Estados de pedido

`PENDIENTE` | `PAGADO` | `ENTREGADO` | `CANCELADO`

Al marcar `ENTREGADO` en admin (solo desde `PAGADO`; no desde `PENDIENTE`), se pide responsable (obligatorio) + nota opcional; se guarda en `datosPaypal` como JSON `{ entrega: { responsable, nota, fecha } }` sin pisar datos PayPal previos.

## Métodos de pago (`tipoPagoId`)

| Código | Significado en UI admin |
|---|---|
| 1 | PayPal |
| 2 | QR |

## Particularidades / riesgos

- En **APK**, descarga QR usa `cordova-plugin-file` (carpeta Descargas); si falla por almacenamiento scoped, abre share sheet como fallback.
- Botón **Compartir QR** solo si `platform.is('cordova')` / `window.cordova`.
- `personal` del pedido se toma de `localStorage.personal` (sesión **cliente**; admin usa `adminPersonal` y no la sobrescribe).
- PayPal cobra en USD (`montoBs / 9`); el pedido y la confirmación guardan/muestran el monto en **Bs**.
- Tras PayPal se actualiza `status=PAGADO`, `tipoPagoId=1` y datos de transacción; una sola navegación a `/confirm`.
- `totalPedido` en `localStorage` guarda el total en Bs (no el envío).
- Para probar cliente + admin a la vez: usa dos pestañas; el login admin ya no pisa el `personal` del cliente.

## Referencias

- [`../integrations/`](../integrations/)
- [`admin.md`](admin.md) — gestión de pedidos
- [`../architecture/navigation_state.md`](../architecture/navigation_state.md)
