# Convenciones

## Descripción

Convenciones inferidas del código Ionic/Angular de ABIMAR. No existe `docs/LINEAMIENTOS_*` en este repo.

## Estructura de una página

Cada feature UI suele tener:

```
src/app/<nombre>/
  <nombre>.module.ts
  <nombre>-routing.module.ts
  <nombre>.page.ts
  <nombre>.page.html
  <nombre>.page.scss
  <nombre>.page.spec.ts   # a menudo plantilla
```

Ruta lazy en `AppRoutingModule` (o child en `admin-home-routing`).

## Nombres

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Page class | `XxxPage` | `HomePage` |
| Module | `XxxPageModule` | `HomePageModule` |
| Service | `XxxService` | `CartService` |
| Selector | `app-xxx` | `app-home` |

Mezcla español/inglés en rutas y labels (`my-cart`, `pedidos`, `categoria-productos`).

## Organización de servicios

- Preferir `src/app/services/` para HTTP/dominio.
- UI helpers en `services/ui/`.
- Evitar `HttpClient` suelto en pages cuando ya hay service (excepción histórica: login).

## URLs

Intención: `this.apiService.url('recurso/accion')` usando `environment.apiBase`.
Evitar literales `https://backend-abimar...` nuevos.

## Estado

- Carrito solo vía `CartService` (no escribir `localStorage.carrito` a mano).
- Flags de menú/guest vía `UtilService`.

## UI Ionic

Usar componentes Ionic (`ion-button`, `ion-list`, …). Loaders vía `LoaderService` o `LoadingController` con dismiss garantizado en error.

## Referencias

- [`../architecture/`](../architecture/)
- [`../ui/`](../ui/)
- [`../modules/README.md`](../modules/README.md)
