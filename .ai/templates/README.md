# Templates

Especificaciones de construcción para **ABIMAR** (Ionic 5 + Angular 10).
Describen **qué debe cumplir** cada tipo de componente, no el código a pegar.
MASTER las usa al implementar.

---

## Catálogo

| Template | Se usa al crear | Capa |
|---|---|---|
| [`feature.md`](feature.md) | un área de negocio con una o más páginas | Page + Service |
| [`api.md`](api.md) | un endpoint o recurso HTTP nuevo del backend | Config / Service |
| [`service.md`](service.md) | servicio Angular de dominio, HTTP o UI | Service |
| [`state.md`](state.md) | estado reactivo compartido (`BehaviorSubject`) | Service |
| [`page.md`](page.md) | página Ionic lazy + ruta | Page |
| [`widget.md`](widget.md) | componente Angular/Ionic reutilizable | Shared UI |
| [`test.md`](test.md) | spec de page, service o component | test |

### Omitidos (justificación)

| Template Flutter listado en P05 | Motivo |
|---|---|
| `repository.md`, `datasource.md`, `usecase.md`, `dto_mapper.md` | No existen en este proyecto |
| `screen.md` | Sustituido por [`page.md`](page.md) (término Ionic) |
| `controller.md` | No hay controllers como tipo de componente |

`service.md` **sí** se crea: el proyecto usa Application services (`ApiService`, `PedidoService`, `CartService`, …).

---

## Cómo elige MASTER un template

1. Clasifica la tarea (paso 2 de MASTER).
2. Pregunta a CodeGraph si la pieza ya existe. Si existe, se extiende; no se inventa otra.
3. Componente nuevo → template de su tipo. Área nueva completa → parte de [`feature.md`](feature.md).
4. Si no encaja en ningún template, se detiene y lo informa.

Orden de construcción de abajo hacia arriba:

`api` → `service` / `state` → `page` → `widget` → `test`

---

## Estructura común

Todos siguen: objetivo, cuándo sí/no, responsabilidades, dependencias permitidas/prohibidas,
entradas, salidas, validaciones, convenciones, errores comunes, referencias.
`test.md` adapta el esqueleto (ubicación y dobles en lugar de dependencias de capa).

Ningún template repite Knowledge ni Memory: los enlaza.

---

## Referencias

[`../knowledge/`](../knowledge/) · Memory MCP · [`../knowledge/conventions/`](../knowledge/conventions/) · CodeGraph
