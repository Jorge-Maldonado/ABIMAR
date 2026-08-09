# P08 — Task

**Ejecutar:** cuando quieras forzar el flujo completo de MASTER en una tarea grande.
**Depende de:** `.ai/MASTER.md`.
**Produce:** un plan y su implementación. Ningún artefacto del workspace.

En el día a día no hace falta: `.cursor/rules/master.mdc` ya aplica MASTER automáticamente.
Este prompt existe para las tareas donde quieres el plan explícito antes de tocar código.

---

## Cómo usarlo

Copiar el bloque siguiente al chat, rellenar lo que sepas y borrar lo que no aplique.
Los huecos vacíos no se inventan: MASTER preguntará por ellos.

```
Sigue .ai/MASTER.md como cambio estructural.

Tarea:
Módulo o feature afectado:
Contrato de API (MSM, método, path, body, response):
Restricciones o decisiones ya tomadas:
Qué NO debe tocarse:

Antes de escribir código, entrégame el plan del paso 8 y espera mi visto bueno.
```

---

## Qué esperar

1. MASTER declara la profundidad elegida en una línea.
2. Consulta Memory, Knowledge y CodeGraph, y dice qué encontró reutilizable.
3. Entrega el plan: objetivo, archivos, impacto, orden, riesgos y validaciones.
4. Se detiene. No implementa hasta tu aprobación.
5. Implementa, valida y te dice si algo debe actualizarse en Knowledge o Memory.

Si MASTER empieza a escribir código antes del punto 3, la regla no se está aplicando:
verificar que `.cursor/rules/master.mdc` existe y tiene `alwaysApply: true`.
