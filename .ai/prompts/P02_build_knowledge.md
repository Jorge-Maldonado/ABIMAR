# P02 — Knowledge Builder

**Ejecutar:** una vez, al construir el workspace. Re-ejecutar solo tras un cambio arquitectónico.
**Depende de:** `docs/`, CodeGraph MCP.
**Produce:** `.ai/knowledge/**`
**Contrato base:** leer `.ai/prompts/CONVENTIONS.md` antes de empezar.

---

## Rol

Principal Software Architect especializado en documentación de software y bases de conocimiento para IA.
No programas. No generas código. Tu única salida es documentación en `.ai/knowledge/`.

---

## Objetivo

Que cualquier IA comprenda el proyecto sin volver a recorrer el código.
Modular, cruzada por referencias, sin duplicación.

---

## Regla crítica: `docs/` ya existe

El proyecto tiene documentación previa en `docs/`. Léela **antes** de escribir nada.

| Documento | Contiene |
|---|---|
| `docs/GUIA_DESARROLLO_FLUTTER.md` | onboarding, BLoC, estructura de carpetas, orden UI→API |
| `docs/LINEAMIENTOS_FLUTTER.md` | convenciones |
| `docs/MANUAL_NUEVO_FEATURE.md` | procedimiento de feature end-to-end |
| `docs/ENTORNOS_Y_API.md` | ambientes, hosts, MSM |

Para cada tema, decide **una** de estas tres opciones y déjala anotada:

1. **Referenciar** — `docs/` ya lo cubre bien. Knowledge enlaza y no repite.
2. **Migrar** — pertenece a Knowledge. Se mueve y `docs/` queda con un enlace.
3. **Crear** — no existe en ningún lado.

Nunca una cuarta opción. Duplicar `docs/` dentro de `.ai/knowledge/` invalida el workspace completo.

---

## Estructura a crear

```
.ai/knowledge/
  README.md        índice + mapa de qué vive aquí y qué vive en docs/
  context/         objetivo, problema, usuarios, alcance, stack
  architecture/    capas, responsabilidades, flujo de datos, patrones, DI, reglas entre capas
  modules/         por feature: propósito, responsabilidades, dependencias, componentes
  ui/              navegación, gestión de estado, estructura de features, widgets compartidos
  integrations/    APIs externas, SDK, servicios de terceros, agrupación de servicios y dominios
  security/        autenticación, autorización, almacenamiento seguro, manejo de tokens
  conventions/     nombres, estructura, organización, reglas generales
  glossary/        términos del proyecto y del negocio
  dependencies/    frameworks, librerías, herramientas y por qué están
```

Crear README solo en `.ai/knowledge/` y en las carpetas con más de un documento.
Omitir cualquier carpeta que el proyecto no justifique, y decirlo en el resumen final.

Nota: dominio y capa de datos (entities, usecases, repositories, datasources, DTO, mappers)
se documentan en `architecture/` como reglas de capa y en `modules/` como detalle por feature.
No crear una carpeta `backend/`: este proyecto es un cliente móvil.
El detalle de endpoints individuales queda fuera de alcance en esta etapa.

---

## El único diagrama que se mantiene a mano

Dentro de `architecture/` incluir un diagrama Mermaid de **intención arquitectónica**:
capas, dependencias permitidas y flujo principal. Es lo que CodeGraph no puede inferir,
porque describe lo que *debe* ocurrir, no lo que ocurre.

No generar diagramas de imports, dependencias entre archivos, grafos de llamadas ni jerarquías de clases:
CodeGraph los responde en vivo y una copia estática nace obsoleta.
Máximo 30 nodos. Sin nodos huérfanos. Nombres idénticos a los del código.

---

## Formato de cada documento

Descripción · Responsabilidad · Relaciones · Ejemplos solo cuando aclaren · Referencias cruzadas.

---

## Restricciones adicionales

No generar templates, playbooks ni prompts. No escribir en Memory (solo lectura).

---

## Cierre

Aplicar la sección 8 de `CONVENTIONS.md`, añadiendo la tabla de decisiones
referenciar / migrar / crear tomadas sobre `docs/`.
