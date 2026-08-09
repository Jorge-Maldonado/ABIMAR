# P06 — Playbook Builder

**Ejecutar:** una vez, después de P05. Re-ejecutar cuando cambie el proceso de trabajo del equipo.
**Depende de:** `.ai/knowledge/`, `.ai/templates/`, Memory MCP.
**Produce:** `.ai/playbooks/**`
**Contrato base:** leer `.ai/prompts/CONVENTIONS.md` antes de empezar.

---

## Rol

Principal Software Architect especializado en procesos de desarrollo reutilizables para asistentes de IA.
Construyes los procedimientos que MASTER sigue antes de actuar. No escribes código ni funcionalidades.

---

## Estructura a crear

```
.ai/playbooks/
  README.md          qué es un playbook, cómo los invoca MASTER, cómo se combinan, en qué orden
  analysis.md        \
  implementation.md   |
  validation.md       |  playbooks de proceso: genéricos, sin lógica del proyecto
  documentation.md    |
  maintenance.md     /
  new_feature.md     playbook de proyecto: ya existe, migrado desde docs/. No reescribirlo.
```

Dos tipos, con reglas distintas:

- **De proceso** — describen *cómo se trabaja*. Genéricos, reutilizables, sin detalles del proyecto.
- **De proyecto** — describen *un procedimiento concreto de este repositorio*, con rutas y clases reales.
  Se crean solo cuando el procedimiento se repite. Hoy existe `new_feature.md`.

---

## Esqueleto obligatorio de cada playbook

Objetivo · Entradas · Herramientas utilizadas · Proceso paso a paso · Validaciones ·
Resultado esperado · Archivos afectados · Referencias.

---

## Contenido por playbook

**analysis.md** — comprender una solicitud antes de generar cambios.
Interpretación de la solicitud · clasificación por profundidad (ver `.ai/MASTER.md`) ·
identificación del módulo · consulta de Memory y Knowledge · búsqueda de implementaciones similares
vía CodeGraph · detección de impacto · definición de estrategia · criterios para rechazar una solicitud ambigua.

**implementation.md** — cómo construir la solución.
Componentes involucrados · templates aplicables · orden de construcción · respeto de la arquitectura ·
verificaciones durante el trabajo · reutilización de componentes existentes · prohibición de duplicar.

**validation.md** — qué comprobar antes de dar algo por terminado.
Revisión arquitectónica · cumplimiento de templates y convenciones · consistencia con Knowledge ·
impacto sobre otros módulos · detección de riesgos · lista de validaciones mínimas.

**documentation.md** — cuándo y qué actualizar.
Cuándo tocar Knowledge y Memory · qué documentar · qué no documentar ·
cómo mantener las referencias cruzadas.

**maintenance.md** — mantener el workspace sano.
Identificación de información obsoleta · limpieza · contraste de Knowledge contra el código real
vía CodeGraph · verificación de templates · referencias rotas · control de consistencia general.

---

## Calidad

Los playbooks son independientes. Los de proceso no contienen lógica específica del proyecto.
Ninguno duplica templates ni Knowledge: cuando una regla ya existe, la referencian.

---

## Cierre

Aplicar la sección 8 de `CONVENTIONS.md`, añadiendo la cobertura funcional alcanzada
y los playbooks adicionales que recomiendas.
