# Red y API

## Descripción

Comunicación HTTP con el backend ABIMAR vía `HttpClient`. Base canónica en `environment.apiBase`.

## Responsabilidad

| Pieza | Rol |
|---|---|
| `src/environments/environment.ts` | `apiBase` en desarrollo |
| `src/environments/environment.prod.ts` | `apiBase` en producción (mismo host hoy) |
| `ApiService` | helper genérico `url()`, `get/post/put/delete` |
| `PedidoService` | endpoints de pedido/detalle (host propio hardcodeado) |
| Pages (`login`, `home`, `productos`, …) | muchas arman la URL completa en el call site |

Valor actual de `apiBase`:

`https://backend-abimar.onrender.com/abimar/core/api`

## Patrones observados

- La mayoría de operaciones de negocio usan **POST** incluso para listar/leer/actualizar (`/list`, `/read`, `/update`, `/delete?id=`).
- Login usa `HttpClient` directo (no `ApiService`), `responseType: 'text'`, body tipo `"Login correcto, <personalId>"`.
- No hay interceptor de auth ni headers de Bearer token en las llamadas actuales.
- CORS: orígenes web + Cordova/APK en backend (`CorsConfig` + `@CrossOrigin`). Requiere redeploy en Render.
- Disponibilidad: cold start posible en Render.

## Dominios de API usados por el front

| Prefijo relativo | Uso |
|---|---|
| `/login` | autenticación |
| `/persona/*`, `/usuario/*`, `/rol/*` | identidad y admin de usuarios |
| `/categoria/*`, `/producto/*` | catálogo |
| `/pedido/*`, `/detallepedido/*` | órdenes |

## Intención vs realidad

**Intención:** toda URL sale de `environment.apiBase` vía `ApiService.url(path)`.
**Realidad:** coexisten `ApiService.url`, `PedidoService.API` y strings literales en Pages.

## Referencias

- [`README.md`](README.md) — capas
- [`../integrations/`](../integrations/) — backend y pagos
- [`../security/`](../security/) — login y almacenamiento de sesión
