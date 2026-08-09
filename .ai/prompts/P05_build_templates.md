# P05 — Template Builder

**Ejecutar:** una vez, después de P02 y P04. Re-ejecutar al introducir un tipo de componente nuevo.
**Depende de:** `.ai/knowledge/`, Memory MCP, CodeGraph MCP.
**Produce:** `.ai/templates/**`
**Contrato base:** leer `.ai/prompts/CONVENTIONS.md` antes de empezar.

---

## Rol

Software Architect especializado en estandarización.
Construyes especificaciones de construcción, no código. MASTER las usará para generar implementaciones.

---

## Estructura a crear

```
.ai/templates/
  README.md       índice + cómo elige MASTER un template
  feature.md      Data, Domain, Presentation, comunicación entre capas, dependencias
  repository.md   interface, implementación, uso del datasource, conversión, manejo de errores
  datasource.md   remote, local, consumo de API, persistencia
  usecase.md      responsabilidad, entradas, salidas, reglas; cuándo NO crear uno
  dto_mapper.md   DTO sin lógica, serialización, deserialización; mapper origen→destino
  state.md        gestión de estado del proyecto: eventos, estados, efectos
  screen.md       navegación, estados de pantalla, composición, casos de uso
  widget.md       reutilización, parámetros, estado, tema, responsive
  api.md          endpoints, cliente HTTP, envelopes, manejo de errores
  test.md         objetivo, cobertura, mocks, fakes, fixtures
```

No crear `controller.md` ni `service.md`: este proyecto no usa esas piezas.
Si aparecen, se añaden entonces, no antes.
Crear un template solo si el proyecto realmente usa ese componente. Justificar las omisiones.

---

## Esqueleto obligatorio de cada template

1. **Objetivo** — responsabilidad única.
2. **Cuándo usarlo / cuándo no** — ambas ramas, explícitas.
3. **Responsabilidades**
4. **Dependencias permitidas**
5. **Dependencias prohibidas**
6. **Entradas**
7. **Salidas**
8. **Validaciones** — qué comprobar antes de darlo por terminado.
9. **Convenciones** — nombres, ubicación, organización.
10. **Errores comunes**
11. **Referencias** — Knowledge, Playbooks, y el componente real del proyecto que sirve de ejemplo canónico.

---

## Restricciones adicionales

Se admite un esqueleto de código mínimo en la sección **Salidas**, y solo ahí: la forma de la clase,
las firmas y el punto exacto donde suele fallar el cableado. Nada de implementaciones completas,
lógica de negocio ni archivos reales del proyecto. El criterio: si el esqueleto envejecería
con un cambio de código, sobra.

Si el esqueleto de once secciones no encaja con el tipo de componente, se adapta y se justifica
en el cierre. `test.md` es el caso conocido: describe ubicación y dobles en lugar de dependencias.

Cada template es independiente y no repite reglas de Knowledge: las enlaza.

---

## Cierre

Aplicar la sección 8 de `CONVENTIONS.md`.
