# Playbook — Feature nuevo (ABIMAR)

Procedimiento concreto para construir un área de negocio end-to-end en este repositorio Ionic.
Ejemplo de referencia cableada: `src/app/admin/pedidos/` + `PedidoService`.

**Objetivo.** Llevar un feature desde el contrato de API hasta la UI sin romper Page→Service→HTTP.
**Entradas.** Path relativo a `apiBase`, body/response, pantallas y ruta (root o child de `admin-home`).
**Herramientas.** CodeGraph · Memory · `.ai/knowledge/` · `.ai/templates/`.
**Profundidad MASTER.** Cambio estructural.

> Nota P06: el `new_feature.md` previo describía Flutter/FIE y no aplicaba a este repo.
> No existía `docs/MANUAL_*` que migrar; este es el procedimiento de proyecto vigente.

---

## 1. Antes de codear

Confirmar:

| Dato | Ejemplo |
|---|---|
| Path relativo | `pedido/list` (sin host) |
| Método | casi siempre `POST` (contrato ABIMAR) |
| Body / response | JSON; listados suelen ser arrays |
| ¿Auth header? | hoy no hay Bearer; sesión en `localStorage` |
| Ruta UI | `/mi-feature` o `/admin-home/mi-feature` |
| Audiencia | cliente / admin / ambos |

URL final (nunca armar el host en la Page):

```
{environment.apiBase}/{path}
```

Antes de crear nada: CodeGraph — ¿existe ya page/service/ruta equivalente?

---

## 2. Cadena

```
Page  →  XxxService (y/o ApiService)  →  HttpClient  →  backend ABIMAR
              ↘ localStorage / BehaviorSubject si hay estado compartido
```

| Pieza | Hace | ¿URLs? |
|---|---|---|
| Page | UI, validación, navegación | no |
| Service | HTTP, estado | solo vía `apiBase` / `ApiService.url` |
| `environment` | host y prefijo | sí |

Templates: [`../templates/api.md`](../templates/api.md) → [`service.md`](../templates/service.md) / [`state.md`](../templates/state.md) → [`page.md`](../templates/page.md) → [`test.md`](../templates/test.md).
Área completa: [`../templates/feature.md`](../templates/feature.md).

---

## 3. Pasos

### 3.1 API / Service

- Añadir métodos en un `XxxService` `providedIn: 'root'` bajo `src/app/services/`.
- Preferir `ApiService.url('recurso/accion')` o `environment.apiBase`.
- No copiar el patrón de URL absoluta en Pages.

### 3.2 Page + módulo lazy

```
src/app/<nombre>/
  <nombre>.module.ts
  <nombre>-routing.module.ts
  <nombre>.page.ts|html|scss
  <nombre>.page.spec.ts
```

### 3.3 Ruta

- Cliente: entrada en `AppRoutingModule` con `loadChildren`.
- Admin: child en `admin-home-routing.module.ts` si pertenece al panel.
- Actualizar menú (`app.component.html` o menú admin) solo si debe ser visible.

### 3.4 Estado compartido (si aplica)

- Carrito / flags: extender `CartService` / `UtilService` o crear state service según [`state.md`](../templates/state.md).
- No escribir las mismas claves de `localStorage` desde la Page.

### 3.5 Widget (si aplica)

- Componentes reutilizables en `src/app/components/`; declarar en el NgModule correcto.

### 3.6 Test

- Spec con mock del service / `HttpClientTestingModule`; sin pegarse a Render.

### 3.7 Knowledge

- Si el área es estable, documentar en `.ai/knowledge/modules/` ([`documentation.md`](documentation.md)).

---

## 4. Validaciones específicas

Además de [`validation.md`](validation.md):

- [ ] `IonicModule` importado en el PageModule.
- [ ] Ruta lazy resoluble.
- [ ] Ningún host literal nuevo en la Page.
- [ ] Service sin imports de Pages.
- [ ] Scripts del proyecto (`ng`/`npm test` según `package.json`) en verde para lo tocado.

---

## 5. Resultado esperado

Feature navegable, HTTP encapsulado, ruta registrada, deuda de URLs no ampliada, doc de módulo si aplica.

## Archivos afectados (típicos)

`src/app/<feature>/**` · `src/app/services/**` · `src/app/app-routing.module.ts` y/o `admin-home-routing.module.ts` · menú · `*.spec.ts` · opcional `.ai/knowledge/modules/`.

## Referencias

[`../knowledge/modules/`](../knowledge/modules/) · [`../knowledge/architecture/`](../knowledge/architecture/) · [`../templates/`](../templates/) · Memory: `Decision.ArquitecturaPageService` · `Regla.UrlsDesdeEnvironment` · `Patron.LazyPageModule`
