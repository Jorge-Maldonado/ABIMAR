# Admin

## Descripción

Panel de administración bajo `/admin-home` con menú propio (`adminMenu`).

## Responsabilidad

| Ruta hija | Página | Hace |
|---|---|---|
| `dashboard` | `DashboardPage` | KPIs reales + **Descargar reporte** (HTML imprimible/PDF) de lo visible |
| `roles` | `RolesPage` | CRUD roles |
| `usuarios` | `UsuariosPage` | personas + logins combinados; CRUD |
| `categorias` | `CategoriasPage` | CRUD categorías |
| `productos` | `ProductosPage` | CRUD productos: toggles `destacado`/`masVendido`, filtros categoría/stock/vitrina, selector imagen |
| `pedidos` | `PedidosPage` | listar/filtrar (estado+pago), panel detalle lateral, cambiar estado + toasts |
| `contactos` | `ContactosPage` | listar mensajes `/contacto/list`; detalle; marcar atendido (`estado=0`) |

Shell: `AdminHomePage` navega a children; logout limpia solo `adminUsuario`/`adminPersonal`.

## Componentes

- `ApiService` para roles/usuarios/categorías/productos.
- `PedidoService` para pedidos.
- `ContactoService` para mensajes de contacto.
- `ImageSelectorComponent` (modal): UI Dark Tech con grilla, búsqueda y confirmación; lista desde `assets/products/index.json`.

## Dependencias

- Acceso previsto solo tras login admin; **sin AuthGuard**.
- Comparte backend con la tienda.

## Particularidades

- Layout admin compartido: contenedor `max-width: 1600px`, y en CRUD con form (Usuarios/Productos/Categorías) grid `380px 1fr` (form sticky + listado).
- `UsuariosPage` une `/persona/list` + `/usuario/list` por `personal` ↔ `idpersona`. Selector de rol: alerta Ionic (no popover) para que no lo recorte el formulario.
- Al crear usuario desde admin hay llamadas duplicadas a `/usuario/create` (persona y login) — revisar al tocar ese flujo.
- Pedidos: colores/iconos por status (`PENDIENTE`/`PAGADO`/`ENTREGADO`/`CANCELADO`); método pago 1=PayPal, 2=QR.
- Admin pedidos enriquece `clienteNombre` con `persona/list` (`personal` → nombres+apellidos) y líneas con imagen vía `producto/list`.
- Al marcar PAGADO sin método, admin pide QR/PayPal; la página QR setea `tipoPagoId=2` al entrar.
- Al marcar ENTREGADO (solo si estaba PAGADO), pide responsable + nota; persiste en `datosPaypal.entrega`.
- Producto: create/update envían `destacado` y `masVendido` (boolean); el home filtra esas banderas.
- Formulario producto: selector de categoría custom + alert estilizado; picker de imagen con preview CTA.
- Al añadir imagen en `assets/products/`, el listado `index.json` se regenera en `npm run build` / `build:app` / `android:add`.
- Dashboard: botón **Descargar reporte** genera un HTML con KPIs, estados, ventas 7 días, métodos de pago, top productos y pedidos recientes. Abrir el archivo e Imprimir → Guardar como PDF.

## Referencias

- [`auth.md`](auth.md)
- [`cart_checkout.md`](cart_checkout.md)
- [`../security/`](../security/)
