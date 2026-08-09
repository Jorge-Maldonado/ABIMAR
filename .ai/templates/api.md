# Template — API

## Objetivo

Incorporar un recurso HTTP del backend ABIMAR de forma que el front lo consuma solo vía `environment.apiBase`.

## Cuándo usarlo / cuándo no

**Usarlo** al añadir un path nuevo (`/recurso/list|create|update|…`) o un dominio REST nuevo.

**No usarlo** para lógica de UI, ni para inventar un cliente HTTP paralelo a `HttpClient`/`ApiService`.

## Responsabilidades

- Definir path relativo al `apiBase`.
- Exponer el consumo en un Service (no en la Page).
- Respetar el estilo del backend: POST con body JSON para list/read/update/delete cuando así esté el API.

## Dependencias permitidas

`environment.apiBase` · `ApiService.url(path)` · `HttpClient` dentro de un Service · tipos/interfaces locales del payload.

## Dependencias prohibidas

Hosts literales `https://backend-abimar...` en Pages · segundo `apiBase` hardcodeado en el service · interceptores inventados sin decisión confirmada.

## Entradas

Método efectivo (casi siempre POST) · path · body · forma de la respuesta · códigos de error conocidos (ej. 401 en login).

## Salidas

Esqueleto mínimo en el Service:

```typescript
// path relativo — nunca host completo
this.api.post(this.apiService.url('recurso/list'), {});
```

O, si el service usa `HttpClient` directo:

```typescript
this.http.post(`${environment.apiBase}/recurso/list`, {});
```

## Validaciones

- Path construido solo desde `apiBase`.
- Errores HTTP no se muestran con `e.toString()` crudo al usuario sin mensaje controlado.
- CodeGraph: no duplicar el mismo endpoint en otro service.

## Convenciones

Paths en minúsculas con recurso/acción. Dominios existentes: login, persona, usuario, rol, categoria, producto, pedido, detallepedido.

## Errores comunes

- Pegar la URL absoluta en la Page (deuda actual en home/productos; no repetir).
- Duplicar `private API` como en `PedidoService` en lugar de `environment`.

## Referencias

Knowledge: [`../knowledge/architecture/network.md`](../knowledge/architecture/network.md) · [`../knowledge/integrations/`](../knowledge/integrations/)
Memory: `Regla.UrlsDesdeEnvironment` · `Patron.PostParaCrudApi` · `Integracion.BackendAbimar`
Ejemplo canónico de helper: `ApiService` · ejemplo de dominio: métodos de `PedidoService` (mejorar host al tocar)
