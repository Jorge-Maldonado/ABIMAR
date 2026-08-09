# Playbook — Implementación

Cómo escribir el cambio una vez cerrado el análisis.
Corresponde a los pasos 6–9 de [`../MASTER.md`](../MASTER.md).

---

## Objetivo

Construir solo lo planificado, en orden, cumpliendo templates y reglas permanentes.

## Entradas

Plan de [`analysis.md`](analysis.md) · templates aplicables · reglas de Memory/Knowledge.

## Herramientas utilizadas

CodeGraph MCP · [`../templates/`](../templates/) · Memory MCP · `.ai/knowledge/` · editor.

## Proceso paso a paso

### 1. Orden de construcción

Siempre de abajo hacia arriba. El orden canónico del proyecto está en
[`../templates/README.md`](../templates/README.md):

```
api  →  service / state  →  page (+ ruta)  →  widget  →  test
```

Un feature completo sigue además [`new_feature.md`](new_feature.md).

### 2. Antes de crear cualquier pieza

Preguntar a CodeGraph si ya existe un equivalente.
Extender lo existente suele ser mejor que crear un paralelo.

### 3. Aplicar el template

Cada pieza nueva cumple su template. Si no encaja en ninguno, detenerse y preguntar.

### 4. Respetar la arquitectura

Las reglas no negociables viven en Memory y Knowledge (capas, URLs, dependencias Page↔Service).
Consultarlas; no redefinirlas aquí. Si el código actual las incumple (deuda), no ampliar esa deuda.

### 5. Verificar durante el trabajo

Tras cada pieza: ¿compila el módulo? ¿la firma que consume la capa de arriba ya existe?
¿CodeGraph sigue mostrando el blast radius esperado?

### 6. Alcance

Solo lo del plan. Un refactor oportunista se anota y se propone aparte.
Si hay que salirse del plan → volver a [`analysis.md`](analysis.md).

## Validaciones (durante implementación)

- [ ] Ninguna pieza nueva sin template o sin confirmación CodeGraph de "no existe".
- [ ] No se duplicó un service/page/component existente.
- [ ] Comentarios solo si explican una restricción no obvia en el código.

## Resultado esperado

Código alineado al plan, listo para [`validation.md`](validation.md).

## Archivos afectados

Los declarados en el plan (Pages, Services, rutas, components, specs, assets si aplica).

## Referencias

[`analysis.md`](analysis.md) · [`validation.md`](validation.md) · [`new_feature.md`](new_feature.md) · [`../templates/`](../templates/) · Memory · [`../knowledge/architecture/`](../knowledge/architecture/)
