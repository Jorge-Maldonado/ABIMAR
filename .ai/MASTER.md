# MASTER

Punto de entrada único para cualquier tarea en este proyecto (**ABIMAR** — Ionic 5 + Angular 10).
Piensa primero como arquitecto, después como ingeniero, al final como programador. Nunca al revés.

**MASTER nunca empieza escribiendo código. Siempre empieza comprendiendo el problema.**

---

## Fuentes disponibles

| Fuente | Contenido | Responde |
|---|---|---|
| Memory MCP | reglas, patrones, decisiones, integraciones (grafo) | qué regla o decisión aplica |
| [`knowledge/`](knowledge/) | contexto, arquitectura, módulos, UI, seguridad, integraciones, conventions, dependencias, glosario | cómo está pensado el sistema |
| CodeGraph MCP | índice vivo de `src/` | cómo está el código realmente hoy |
| [`templates/`](templates/) | feature, api, service, state, page, widget, test | qué debe cumplir lo que se construya |
| [`playbooks/`](playbooks/) | analysis, implementation, validation, documentation, maintenance + `new_feature` | cómo se ejecuta el trabajo |
| `docs/` | documentación humana preexistente | convenciones operativas — **hoy no hay carpeta `docs/` en este repo** |

Si una fuente falta o está desactualizada, decirlo en la respuesta.
Índice temático: [`knowledge/README.md`](knowledge/README.md).
Arquitectura Page → Service → HTTP: [`knowledge/architecture/`](knowledge/architecture/).

Uso de Memory y CodeGraph: secciones 5 y 6 de [`prompts/CONVENTIONS.md`](prompts/CONVENTIONS.md). No reescribirlas aquí.

---

## Paso 1 — Comprender

Si la solicitud es ambigua, falta información o hay conflicto arquitectónico: preguntar y detenerse. No adivinar.

## Paso 2 — Clasificar

**Tipo:** Feature · Bug · Refactor · Optimización · Documentación · Testing · Arquitectura · Análisis · Consulta · Otro.

**Profundidad:** elegir una y declararla al usuario en una línea, en la primera respuesta.

| Profundidad | Cuándo | Pasos a ejecutar |
|---|---|---|
| **Consulta** | preguntas, exploración, "¿dónde está X?", "¿cómo funciona Y?". No se escribe código. | 1, 2, 4, 5 y responder |
| **Cambio acotado** | bug o ajuste dentro de una page/service existente, sin componentes nuevos | 1–5, 9, 10, 11 |
| **Cambio estructural** | feature nuevo, page/service/widget nuevo, refactor entre capas, contrato de API nuevo | 1–12 completos |

Ante la duda, subir de nivel, nunca bajar.
Si durante un cambio acotado hace falta crear un componente nuevo: detenerse, reclasificar como estructural y retomar desde el paso 6.

## Paso 3 — Knowledge

Leer solo los documentos relacionados de [`knowledge/`](knowledge/). Nunca la carpeta completa.
Usar el índice de [`knowledge/README.md`](knowledge/README.md).

## Paso 4 — Memory

Buscar reglas, convenciones, decisiones y patrones del área afectada (`search_nodes` / `open_nodes`).

## Paso 5 — CodeGraph

Buscar implementaciones similares, dependencias, impacto y piezas reutilizables.
Pasar `projectPath` al workspace si el servidor no tiene raíz cargada.
Consulta obligatoria antes de crear: feature, service, page, widget, endpoint/API helper.

Procedimiento de los pasos 1–5: [`playbooks/analysis.md`](playbooks/analysis.md).

## Paso 6 — Templates

Elegir especificación en [`templates/`](templates/). Todo componente nuevo sigue un template.
Si no encaja en ninguno, detenerse y preguntar. No improvisar tipos (repository, BLoC, datasource, etc.).

## Paso 7 — Playbooks

Seleccionar de [`playbooks/`](playbooks/). No inventar procedimientos.
Por defecto: `analysis` → `implementation` → `validation` → `documentation`.
Feature nuevo: además [`playbooks/new_feature.md`](playbooks/new_feature.md).
Mantenimiento del workspace: [`playbooks/maintenance.md`](playbooks/maintenance.md).

## Paso 8 — Plan

Objetivo · archivos · impacto · orden · riesgos · validaciones.
Si supera cinco pasos o toca más de tres capas, presentarlo antes de ejecutar.

## Paso 9 — Reutilización

Antes de crear cualquier componente, verificar con CodeGraph que no exista. Nunca duplicar.

## Paso 10 — Implementar

De abajo hacia arriba:

```
api  →  service / state  →  page (+ ruta)  →  widget  →  test
```

Ver [`playbooks/implementation.md`](playbooks/implementation.md) y [`templates/README.md`](templates/README.md).
Respetar Memory/Knowledge: Page → Service → HTTP; Service ↛ Page; URLs desde `environment.apiBase` / `ApiService.url`.

## Paso 11 — Validar

Analizador y tests del proyecto (`package.json`), más arquitectura, cableado, seguridad e UI según [`playbooks/validation.md`](playbooks/validation.md).
Reportar qué se verificó y qué no se pudo verificar.

## Paso 12 — Actualizar

Knowledge y Memory solo si cambió información permanente y en un único sitio.
Ver [`playbooks/documentation.md`](playbooks/documentation.md).

---

## Reglas generales

Nunca empezar por el código · nunca ignorar Memory · nunca ignorar CodeGraph ·
nunca crear componentes duplicados · nunca romper la arquitectura · nunca tocar módulos no relacionados ·
nunca ampliar deuda de hosts hardcodeados en Pages.

---

## Criterios para detenerse

Solicitud ambigua · información faltante · conflicto arquitectónico · contexto insuficiente ·
template inexistente para el tipo de pieza pedida.

---

## Resultado esperado

Soluciones consistentes con la arquitectura Ionic existente (Pages lazy + Services `providedIn: 'root'`).
MASTER nunca actúa como generador automático de código. Siempre actúa como arquitecto de software.
