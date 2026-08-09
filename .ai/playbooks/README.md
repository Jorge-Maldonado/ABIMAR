# Playbooks

Procedimientos operativos que sigue [`../MASTER.md`](../MASTER.md). Describen *cómo se trabaja*,
no *qué hace el código*: eso vive en [`../knowledge/`](../knowledge/).

---

## Tipos

**De proceso** — genéricos, sin detalles de dominio del producto. Se aplican a cualquier tarea.
**De proyecto** — procedimiento concreto de este repositorio, con rutas y clases reales.
Se crea solo cuando el procedimiento se repite.

---

## Catálogo

| Playbook | Tipo | Cuándo lo usa MASTER |
|---|---|---|
| [`analysis.md`](analysis.md) | proceso | pasos 1–5: entender la tarea y el impacto |
| [`implementation.md`](implementation.md) | proceso | pasos 6–9: construir en el orden correcto |
| [`validation.md`](validation.md) | proceso | paso 10: comprobar que está terminado |
| [`documentation.md`](documentation.md) | proceso | pasos 11–12: qué actualizar y dónde |
| [`maintenance.md`](maintenance.md) | proceso | revisión periódica del workspace |
| [`new_feature.md`](new_feature.md) | proyecto | feature Ionic end-to-end (API → page → ruta) |

---

## Cómo se combinan

Ciclo de tarea: análisis → implementación → validación → documentación.
`maintenance.md` es periódico y no pertenece a una tarea puntual.

Un playbook de proyecto responde al *qué* de este repo; los de proceso, al *cómo*.
Feature nuevo: [`new_feature.md`](new_feature.md) + los de proceso.

MASTER elige playbook tras consultar Knowledge, Memory y CodeGraph.
En profundidad **consulta** solo aplica `analysis.md`.

Ningún playbook inventa reglas: enlaza Memory, Knowledge y Templates.

---

## Referencias

[`../templates/`](../templates/) · [`../knowledge/`](../knowledge/) · Memory MCP · CodeGraph MCP
