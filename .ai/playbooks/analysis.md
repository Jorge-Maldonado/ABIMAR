# Playbook — Análisis

Cómo entender una tarea antes de tocar nada.
Corresponde a los pasos 1–5 de [`../MASTER.md`](../MASTER.md).

---

## Objetivo

Evitar implementar con una comprensión incompleta o contradictoria.

## Entradas

Solicitud del usuario · contexto de conversación · acceso a Memory, Knowledge y CodeGraph.

## Herramientas utilizadas

Memory MCP · `.ai/knowledge/` · CodeGraph MCP · `docs/` si existe · código solo como último recurso.

## Proceso paso a paso

### 1. Enunciar la tarea en una frase

Qué se pide y qué significa "terminado". Si no cabe en una frase, preguntar y detenerse.

### 2. Clasificar la profundidad

| Profundidad | Señal | Análisis necesario |
|---|---|---|
| Consulta | responder, explicar, localizar | pasos 3 y 4 |
| Cambio acotado | ajuste en pieza existente, sin tipo de componente nuevo | pasos 3–5 |
| Cambio estructural | feature nuevo, service/page/ruta nueva, contrato API nuevo | todos |

Ante la duda, subir de nivel. Si un "acotado" exige un componente nuevo, reclasificar a estructural.

### 3. Consultar en orden

```
Memory  →  .ai/knowledge/  →  CodeGraph  →  docs/ (si existe)  →  código
```

- Memory: qué regla o decisión aplica.
- Knowledge: cómo está pensado el sistema.
- CodeGraph: cómo está el código hoy y el blast radius.
- Código fuente: solo para lo que CodeGraph no cubre.

### 4. Trazar impacto

Con CodeGraph: quién llama al símbolo, qué tests lo cubren, qué rutas/modules/services arrastra.

Dejar respondido:

- ¿Qué capas toca (Shell / Page / Service / Config / Shared UI)?
- ¿Rompe firmas públicas?
- ¿Existe ya algo equivalente?
- ¿Hay specs que fallarán?

### 5. Detectar contradicciones

Si Memory, Knowledge, docs y código discrepan, **reportarlo antes de decidir**. No elegir en silencio.

### 6. Cerrar con un plan

1. Qué cambiar y en qué orden.
2. Qué template aplica a cada pieza nueva ([`../templates/`](../templates/)).
3. Qué validar al terminar ([`validation.md`](validation.md)).
4. Qué queda fuera de alcance.

Si el plan supera cinco pasos o toca más de tres capas, presentarlo antes de ejecutar.

## Validaciones

- La profundidad está declarada al usuario.
- No se empezó a editar código en este playbook.
- Las contradicciones encontradas están listadas.

## Resultado esperado

Plan breve o respuesta de consulta fundamentada en Memory/Knowledge/CodeGraph.

## Archivos afectados

Ninguno (solo lectura).

## Señales de análisis insuficiente

- Se descubre a mitad que el componente ya existía.
- Hay que tocar un archivo fuera del plan.
- Aparece una decisión de arquitectura no tomada.
→ Volver al paso 3; no improvisar.

## Referencias

[`../MASTER.md`](../MASTER.md) · [`implementation.md`](implementation.md) · [`../knowledge/`](../knowledge/) · [`../templates/`](../templates/)
