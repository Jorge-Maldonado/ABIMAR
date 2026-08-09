# Playbook — Documentación

Qué actualizar después de un cambio y dónde.
Corresponde a los pasos 11–12 de [`../MASTER.md`](../MASTER.md).

---

## Objetivo

Dejar una sola fuente de verdad por hecho, sin duplicar ni narrar el sprint.

## Entradas

Cambio ya validado · diff · Knowledge/Memory/templates/playbooks existentes.

## Herramientas utilizadas

Editor · Memory MCP (lectura + escritura solo si pasa el test de permanencia) · CodeGraph (no se documenta lo que responde en vivo).

## Proceso paso a paso

### 1. Regla madre

**Cada hecho vive en un solo sitio.** Si ya está escrito, se enlaza. Si está desactualizado, se corrige ahí. Nunca una segunda versión.

### 2. Dónde va cada cosa

| Lo que cambió | Se documenta en |
|---|---|
| Propósito o particularidad de un módulo | `.ai/knowledge/modules/` |
| Decisión o regla de capas / red / DI / navegación | `.ai/knowledge/architecture/` |
| Integración externa o API estable | `.ai/knowledge/integrations/` |
| Librería añadida o retirada (criterio) | `.ai/knowledge/dependencies/` |
| Término de negocio o de código | `.ai/knowledge/glossary/` |
| Convención de nombres/estructura | `.ai/knowledge/conventions/` (o `docs/` si el equipo la mantiene ahí) |
| Procedimiento repetible | `.ai/playbooks/` |
| Contrato de un tipo de componente | `.ai/templates/` |
| Verdad permanente y buscable | Memory MCP |

La estructura de archivos y el grafo de llamadas los responde CodeGraph: no se copian a Knowledge.

### 3. Qué no documentar

- Quién llama a qué / dónde vive un símbolo (CodeGraph).
- Endpoints uno a uno (viven en Services / llamadas HTTP).
- Estado de tarea o sprint.
- Narración del cambio (“hoy se hizo X”).

### 4. Cuándo escribir en Memory

Solo si pasa: *¿seguirá siendo cierto en seis meses sin depender de esta conversación?*

Sí: regla nueva, patrón con ≥2 apariciones, decisión confirmada, integración estable.
No: refactor en curso, hipótesis, error temporal, ejemplo de código.

Formato: [`../prompts/CONVENTIONS.md`](../prompts/CONVENTIONS.md) §5.

### 5. Cómo se escribe

Un documento por responsabilidad · ~300 líneas máx · una idea por línea · referencias cruzadas al final · sin carpetas vacías.

## Validaciones

- [ ] Ningún hecho en dos sitios.
- [ ] Enlaces relativos resuelven.
- [ ] Correcciones hechas en la ubicación original.
- [ ] Memory solo con afirmaciones permanentes.
- [ ] Documentos obsoletos por el cambio, actualizados en el mismo paso.

## Resultado esperado

Knowledge/Memory/templates/playbooks coherentes con el código tras el cambio.

## Archivos afectados

Solo los de documentación del workspace (y Memory), nunca código de producto en este playbook.

## Referencias

[`../prompts/CONVENTIONS.md`](../prompts/CONVENTIONS.md) · [`../knowledge/`](../knowledge/) · [`maintenance.md`](maintenance.md) · [`validation.md`](validation.md)
