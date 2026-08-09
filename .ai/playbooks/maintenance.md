# Playbook — Mantenimiento

Cómo evitar que el workspace y el código se desalineen.
No corresponde a una tarea puntual: se ejecuta de forma periódica.

---

## Objetivo

Detectar y corregir obsolescencia en Knowledge, Memory, templates, playbooks y reglas Cursor.

## Entradas

Estado actual del repo · acceso a CodeGraph · prompts P00 si existen.

## Herramientas utilizadas

[`../prompts/P00_ai_auditor.md`](../prompts/P00_ai_auditor.md) · CodeGraph · Memory MCP · Knowledge · templates · playbooks.

## Proceso paso a paso

### 1. Auditoría del workspace

```
Ejecuta .ai/prompts/P00_ai_auditor.md --report
```

`--report` informa. `--fix` solo para arreglos de bajo riesgo (enlaces, rutas obsoletas, duplicados).
Frecuencia razonable: tras un feature grande, o cada pocas semanas.

### 2. Señales de desalineación

| Señal | Dónde se corrige |
|---|---|
| Knowledge describe algo inexistente | `.ai/knowledge/` |
| Memory tiene una regla que ya no aplica | Memory (`delete_observations` / `delete_entities`) |
| Template describe un tipo que el proyecto no usa | `.ai/templates/` |
| Playbook cita stack o rutas de otro proyecto | `.ai/playbooks/` |
| MASTER/rules contradicen Knowledge | `.ai/MASTER.md` / `.cursor/rules/` (vía P07/P01) |
| Dos documentos dicen lo mismo | borrar la copia y enlazar |

### 3. Rutina de revisión

1. `P00 --report` y leer hallazgos.
2. Contrastar Knowledge con CodeGraph en áreas tocadas desde la última revisión.
3. Verificar que el catálogo de templates coincide con tipos reales del código.
4. Ejecutar analizador y tests del proyecto sobre la rama principal cuando sea posible.
5. Revisar deuda anotada abajo; retirar ítems cerrados en el mismo cambio.

### 4. Poda de Memory

Retirar observaciones que ya no son ciertas, que CodeGraph responde mejor, o que duplican otra entidad.
Comprobar relaciones con `search_nodes` antes de borrar entidades.

### 5. Versionado del workspace

Subir versión en [`../README.md`](../README.md) solo si cambia la estructura del workspace
(prompt nuevo, carpeta nueva, cambio de `CONVENTIONS.md`). Actualizar texto de Knowledge no es bump de versión.

## Validaciones

- [ ] No quedan referencias a stacks/proyectos ajenos en Knowledge/templates/playbooks activos.
- [ ] Memory y Knowledge no se contradicen.
- [ ] Templates omitidos siguen justificados en su README.

## Resultado esperado

Informe de mantenimiento y, si aplica, PRs/commits solo de documentación del workspace.

## Archivos afectados

`.ai/**`, Memory MCP, opcionalmente `.cursor/rules/` tras P01.

## Deuda conocida vigente (ABIMAR)

Seguir hasta cerrar; retirar de esta lista al resolver:

- URLs absolutas del backend en varias Pages (deben pasar por `environment.apiBase` / `ApiService.url`).
- `PedidoService` duplica el host en constante propia.
- Admin decidido por email hardcodeado en login; sin route guards.
- `DataService` legado coexiste con el catálogo real.
- Specs mayormente plantilla (`should create`) sin aserciones de negocio.
- Workspace AI: MASTER/rules aún pueden mencionar stack Flutter hasta P07/P01.

Detalle en [`../knowledge/architecture/`](../knowledge/architecture/) y [`../knowledge/security/`](../knowledge/security/).

## Referencias

[`../prompts/P00_ai_auditor.md`](../prompts/P00_ai_auditor.md) · [`documentation.md`](documentation.md) · [`../README.md`](../README.md)
