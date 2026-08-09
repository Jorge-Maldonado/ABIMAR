# AI Workspace

Infraestructura de contexto para trabajar este proyecto con asistentes de IA.
No contiene código y no afecta el build.

**Versión 1.0** — completo. Todos los componentes construidos y verificados contra el código.

---

## Cómo funciona

`.cursor/rules/master.mdc` se aplica automáticamente en cada conversación de Cursor y enruta
hacia `.ai/MASTER.md`, que define cómo se resuelve cualquier tarea. No hay que adjuntar nada a mano.

`.cursor/mcp.json` fija la ruta absoluta del índice de CodeGraph. La configuración global usaba
`${workspaceFolder}`, que Cursor no expande, y dejaba el servidor buscando en el directorio equivocado.
**Si tu checkout está en otra ruta, ajústala en ese archivo.**

---

## Mapa

| Ruta | Qué es | Contenido | Lo genera |
|---|---|---|---|
| `.cursor/rules/master.mdc` | activa MASTER en cada conversación | 1 regla `alwaysApply` | P01 |
| `MASTER.md` | orquestador único de tareas | 12 pasos con tres niveles de profundidad | P07 |
| `prompts/CONVENTIONS.md` | contrato común. Fuente única de las reglas compartidas | 8 secciones | — |
| `prompts/` | prompts de construcción y mantenimiento | 8 prompts | — |
| `knowledge/` | documentación estable del proyecto | 9 secciones, 13 documentos | P02 |
| `templates/` | qué debe cumplir cada tipo de componente | 10 especificaciones | P05 |
| `playbooks/` | cómo se analiza, implementa, valida y documenta | 5 de proceso + 1 de proyecto | P06 |
| Memory MCP | conocimiento permanente y buscable | 42 entidades, 51 relaciones | P04 |
| CodeGraph MCP | índice vivo del código | todo el árbol de `lib/` | automático |
| `../docs/` | documentación humana preexistente. Fuente, no destino | lineamientos y entornos | equipo |

No existe carpeta `graphs/`. El único diagrama que se mantiene a mano es el de intención
arquitectónica, dentro de `knowledge/architecture/`. Todo lo demás lo responde CodeGraph en vivo.

---

## Prompts

| Prompt | Produce | Cuándo |
|---|---|---|
| `P01_build_rules` | `.cursor/rules/` | tras cambiar MASTER o el layout |
| `P02_build_knowledge` | `knowledge/` | tras un cambio arquitectónico |
| `P04_build_memory` | Memory MCP | al confirmar una decisión arquitectónica |
| `P05_build_templates` | `templates/` | al introducir un tipo de componente nuevo |
| `P06_build_playbooks` | `playbooks/` | al cambiar el proceso del equipo |
| `P07_build_master` | `MASTER.md` | al cambiar el flujo de trabajo |
| `P08_task` | nada, orquesta | uso diario opcional |
| `P00_ai_auditor` | informe (`--fix` corrige) | cada release |

Orden de construcción desde cero:

```
P02 knowledge → P04 memory → P05 templates → P06 playbooks → P07 master → P01 rules
```

`P00` no forma parte de la cadena: es mantenimiento recurrente sobre el workspace ya construido.
No existe `P03`: producía una carpeta `graphs/` que duplicaba estáticamente lo que CodeGraph
responde actualizado; se eliminó y su única parte útil se plegó en `P02`.

---

## Uso diario

El trabajo diario no usa los prompts de construcción. Basta con pedir la tarea:
la regla siempre activa se encarga del resto. `P08_task` sirve cuando quieres forzar
explícitamente el flujo completo de MASTER en una tarea grande.

Los prompts `P01`–`P07` solo se re-ejecutan cuando cambia la arquitectura o el proceso del equipo.

---

## Reglas del workspace

Todas viven en `prompts/CONVENTIONS.md`. Ningún otro archivo las repite.
Al editar cualquier prompt, verificar que no reintroduce contenido que ya está allí.
