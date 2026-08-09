# P01 — Cursor Rules Builder

**Ejecutar:** una vez, después de P07. Re-ejecutar solo si cambia `.ai/MASTER.md` o el layout de `.ai/`.
**Depende de:** `.ai/MASTER.md`, `.ai/prompts/CONVENTIONS.md`.
**Produce:** `.cursor/rules/*.mdc`
**Contrato base:** leer `.ai/prompts/CONVENTIONS.md` antes de empezar.

---

## Rol

AI Systems Architect. Construyes el mecanismo que hace que MASTER se aplique automáticamente
dentro de Cursor. No escribes código del proyecto.

---

## Problema que resuelve

`.ai/MASTER.md` es un archivo markdown inerte: nada en Cursor lo carga. Sin esta pieza,
el cumplimiento del workspace depende de que cada persona recuerde adjuntar los archivos correctos
en cada conversación, que es justamente el problema que el workspace pretende resolver.

---

## Restricción central: presupuesto de contexto

Una regla `alwaysApply` se inyecta en **cada** petición, incluidas las triviales.
Por eso la regla es un **puntero, no una copia**: dice qué leer y cuándo, nunca reproduce
el contenido de MASTER, CONVENTIONS ni Knowledge.

Presupuesto duro: **máximo 40 líneas** en la regla siempre activa.
Si no cabe, el problema está en MASTER, no en la regla.

---

## Estructura a crear

```
.cursor/rules/
  master.mdc      alwaysApply: true   — enrutador mínimo hacia .ai/MASTER.md
```

Crear reglas adicionales con `globs` solo si existe una convención que aplique a un subconjunto
de archivos y que MASTER no pueda resolver por sí mismo. Ante la duda, no crearlas.

---

## Contenido de `master.mdc`

Front-matter YAML con `description`, `globs` vacío y `alwaysApply: true`.

Cuerpo, en este orden:

1. Una frase: este proyecto se trabaja siguiendo `.ai/MASTER.md`.
2. El gating de profundidad de MASTER, resumido en tres líneas, para que el agente sepa
   si necesita abrir MASTER o no. Es la única concesión a duplicar información,
   y existe porque sin ella toda petición trivial obligaría a leer MASTER completo.
3. Las rutas del workspace y qué contiene cada una, en una línea por ruta.
4. Las tres o cuatro prohibiciones no negociables del proyecto, tomadas de Memory.
5. Cuándo detenerse y preguntar.

Nada más. Sin ejemplos, sin explicaciones, sin justificaciones.

---

## Validaciones antes de cerrar

- La regla no contradice `.ai/MASTER.md`, Playbooks, Templates ni Knowledge.
- No copia ningún bloque de `CONVENTIONS.md`.
- Todas las rutas que menciona existen.
- Cabe en el presupuesto de 40 líneas.
- Una petición de tipo consulta no obliga a cargar todo el workspace.

---

## Cierre

Aplicar la sección 8 de `CONVENTIONS.md`, añadiendo el conteo de líneas de cada regla creada.
