# Knowledge

Documentación estable del proyecto **ABIMAR** (Ionic ecommerce) para consumo de IA.
Complementa `docs/` cuando exista. Ningún tema está documentado dos veces.

---

## Dónde vive cada tema

| Tema | Fuente de verdad |
|---|---|
| Qué es la app, usuarios, alcance, stack | [`context/`](context/) |
| Capas, dependencias permitidas, diagrama | [`architecture/`](architecture/) |
| HTTP, `apiBase`, URLs hardcodeadas | [`architecture/network.md`](architecture/network.md) |
| DI Angular (`providedIn`) | [`architecture/dependency_injection.md`](architecture/dependency_injection.md) |
| Rutas lazy y estado de UI (`UtilService`) | [`architecture/navigation_state.md`](architecture/navigation_state.md) |
| Módulos / páginas por dominio | [`modules/`](modules/) |
| Menú, shell, widgets compartidos | [`ui/`](ui/) |
| Backend ABIMAR, PayPal, QR | [`integrations/`](integrations/) |
| Login, sesión en `localStorage`, roles | [`security/`](security/) |
| Nombres, estructura de páginas Ionic | [`conventions/`](conventions/) |
| Librerías y por qué están | [`dependencies/`](dependencies/) |
| Términos de negocio y del código | [`glossary/`](glossary/) |
| Estructura real del código ahora | CodeGraph MCP |
| Reglas y decisiones permanentes | Memory MCP |

---

## Decisiones tomadas sobre `docs/`

| Tema | Decisión | Motivo |
|---|---|---|
| Toda la documentación humana listada en P02 (`GUIA_*`, `LINEAMIENTOS_*`, `MANUAL_*`, `ENTORNOS_*`) | **crear** en Knowledge | No existe carpeta `docs/` en este repositorio |
| Contexto de producto ABIMAR | **crear** | Solo había un README de UI template + notas de deploy |
| Arquitectura Ionic/Angular, red, DI, navegación | **crear** | No existía documentación de capas |
| Convenciones | **crear** | Sin `LINEAMIENTOS_*` que referenciar |

No se migró nada desde `docs/`: no hay fuente previa que mover.

---

## Estado

Reconstruido contra el código real (Ionic 5 + Angular 10). El Knowledge anterior describía un proyecto Flutter/Banco FIE ajeno a este repo y fue reemplazado.

Lo que Knowledge **no** documenta: listados de archivos por página (CodeGraph en vivo), endpoints uno a uno (viven en llamadas HTTP de Pages/Services), ni el workspace AI fuera de `.ai/knowledge/` (P02 solo produce Knowledge).
