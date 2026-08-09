# Convenciones del AI Workspace

Contrato común a todos los prompts de `.ai/prompts/`.
Cada prompt lo referencia. Ningún prompt copia su contenido.

---

## 1. Layout canónico

```
.ai/
  README.md          Índice y punto de entrada del workspace
  prompts/           Este contrato + P00, P01, P02, P04–P08
  knowledge/         Documentación estable del proyecto       (produce P02)
  templates/         Especificaciones de construcción         (produce P05)
  playbooks/         Procedimientos operativos                (produce P06)
  MASTER.md          Orquestador único de tareas              (produce P07)
.cursor/rules/       Activación de MASTER dentro de Cursor    (produce P01)
docs/                Documentación humana preexistente. Fuente, no destino.
```

Memory vive en Memory MCP, no en disco.
CodeGraph vive en su índice, no en disco.
No existe una carpeta `graphs/`: el único diagrama que se mantiene a mano es el de intención
arquitectónica, y vive dentro de `.ai/knowledge/architecture/`. Todo lo demás lo responde CodeGraph.

---

## 2. Límites (aplican a todos los prompts)

- No escribir, modificar ni refactorizar código del proyecto.
- No crear tests.
- No producir archivos fuera de la ruta declarada en el campo **Produce** del prompt.
- Un prompt, un artefacto. Ningún prompt invade la salida de otro.

---

## 3. Fuente única de verdad

- Antes de escribir algo, buscarlo en `docs/`, `.ai/knowledge/`, `.ai/templates/` y Memory.
- Antes de describir estructura de código, preguntar a CodeGraph. No transcribir lo que ya responde.
- Si ya existe: enlazar. Nunca copiar.
- Si existe y está desactualizado: corregirlo en su ubicación original. Nunca crear una segunda versión.
- `docs/` es preexistente y prevalece como origen. Se referencia o se migra, nunca se clona.

---

## 4. Jerarquía de consulta

```
Memory  →  .ai/knowledge/  →  CodeGraph MCP  →  código fuente (último recurso)
```

Ante una contradicción entre documentación, Memory y código: reportarla. No decidir en silencio.

---

## 5. Contrato de Memory MCP

Memory es un grafo de entidades y relaciones, no un árbol de carpetas.

**Guardar solo:** arquitectura, capas, convenciones, patrones repetidos (≥ 2 apariciones reales),
reglas permanentes, decisiones confirmadas, integraciones estables.

**Nunca guardar:** conversaciones, código, ejemplos, logs, errores temporales, hipótesis,
decisiones pendientes, tareas, estado de un sprint.

**Test previo a escribir:** ¿seguirá siendo cierto dentro de seis meses, sin depender de esta
conversación ni de esta tarea? Si la respuesta es no, no se guarda.

**Nombrado obligatorio** (de esto depende que `search_nodes` funcione):

| Campo | Regla | Ejemplo |
|---|---|---|
| `name` | `Dominio.Concepto` en PascalCase | `Regla.PresentationNoAccedeADatasource` |
| `entityType` | uno de: `architecture`, `convention`, `pattern`, `rule`, `decision`, `integration`, `glossary` | `rule` |
| `observations` | frases atómicas, autocontenidas, en presente. Una idea por observación | `El Bloc nunca construye URLs.` |
| `relations` | verbo en voz activa: `aplica_a`, `depende_de`, `contradice`, `reemplaza` | `Regla.X aplica_a Capa.Presentation` |

---

## 6. Uso de CodeGraph MCP

- CodeGraph es el índice vivo del código. Consultarlo antes de recorrer archivos a mano.
- Nunca materializar en texto aquello que CodeGraph puede responder al momento.
- Consulta obligatoria antes de crear: feature, repository, datasource, usecase, mapper, widget, service.

---

## 7. Calidad de los artefactos generados

- Un documento por responsabilidad. Máximo ~300 líneas. Si crece, dividir.
- No crear carpetas ni archivos vacíos "por si acaso". Si una sección no aplica al proyecto,
  se omite y se justifica en el resumen final.
- Sin relleno vertical: una idea por línea, listas compactas, sin línea en blanco entre viñetas.
- Cada documento declara sus referencias cruzadas al final.

---

## 8. Cierre obligatorio de todo prompt

Terminar con un resumen de máximo 15 líneas:

1. Artefactos creados, con ruta.
2. Artefactos omitidos y motivo.
3. Información faltante detectada.
4. Contradicciones encontradas entre `docs/`, Knowledge, Memory y código.
