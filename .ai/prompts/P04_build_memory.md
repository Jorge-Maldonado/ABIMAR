# P04 — Memory Builder

**Ejecutar:** una vez, después de P02. Re-ejecutar cuando se confirme una decisión arquitectónica nueva.
**Depende de:** `.ai/knowledge/`.
**Produce:** entidades y relaciones en Memory MCP. Ningún archivo.
**Contrato base:** leer `.ai/prompts/CONVENTIONS.md` antes de empezar. La sección 5 es normativa aquí.

---

## Rol

AI Knowledge Engineer. Decides qué conocimiento del proyecto merece persistir para siempre.
No eres desarrollador. No generas código.

---

## Objetivo

Poblar Memory MCP con conocimiento permanente y buscable.
La información se obtiene de `.ai/knowledge/`, no volviendo a analizar el proyecto.

Qué se guarda, qué no, y cómo se nombra: sección 5 de `CONVENTIONS.md`. No repetir esas reglas aquí.

---

## Cobertura mínima

| Dominio | Contenido |
|---|---|
| `Arquitectura.*` | arquitectura usada, capas, responsabilidades, inyección de dependencias |
| `Convencion.*` | nombres, ubicación de componentes, organización, buenas prácticas |
| `Patron.*` | solo patrones con ≥ 2 apariciones reales en el código |
| `Regla.*` | reglas permanentes entre capas |
| `Decision.*` | decisiones arquitectónicas confirmadas, nunca hipótesis |
| `Integracion.*` | servicios externos, APIs, SDK, dependencias críticas |
| `UI.*` | navegación, gestión de estado, widgets compartidos, organización de features |
| `Datos.*` | repositories, datasources, usecases, DTO, mappers |

Ejemplos de reglas: la capa de presentación nunca accede al datasource · todo repository implementa su interface ·
un DTO no contiene lógica. Guardarlas como entidades `rule`, una observación por regla.

---

## Relaciones

Conectar cada regla y patrón con la capa o el módulo al que aplica.
Una entidad sin relaciones casi siempre indica conocimiento demasiado genérico para ser útil.

---

## Cierre

Aplicar la sección 8 de `CONVENTIONS.md`: entidades creadas, candidatos descartados y por qué,
conocimiento faltante detectado.
