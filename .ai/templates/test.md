# Template — Test

## Objetivo

Definir dónde y cómo probar una Page, Service o Component con el stack del proyecto (Jasmine/Karma).

## Cuándo usarlo / cuándo no

**Usarlo** al crear o cambiar comportamiento de una pieza con lógica (HTTP, estado, validaciones).

**No usarlo** para specs vacíos generados por CLI que solo comprueban `should create` sin aserción de negocio — o bien se rellenan o no cuentan como cobertura útil.

## Responsabilidades (en lugar del bloque dependencias)

- Ubicar el spec junto a la pieza: `*.page.spec.ts`, `*.service.spec.ts`, `*.component.spec.ts`.
- Aislar HTTP con mocks de `HttpClient` / spies del service.
- Evitar pegarse al backend real de Render en unit tests.

## Dobles

| Doble | Uso |
|---|---|
| Spy de Service | Page que solo orquesta |
| `HttpClientTestingModule` | Service HTTP |
| Stub de `Router` / `NavController` | navegación |
| Stub de `AlertController` / `LoadingController` | feedback Ionic |

## Entradas

Comportamiento a proteger · casos feliz / error / vacío · fixtures mínimas de payload.

## Salidas

Archivo `*.spec.ts` que compila con `ng test` y afirma el comportamiento acordado.

## Validaciones

- El spec no llama a `backend-abimar.onrender.com`.
- Cubre al menos el camino feliz y un error.
- Nombres de describe/it legibles en español o inglés, consistentes con el archivo.

## Convenciones

Herramientas actuales: Jasmine + Karma. E2E Protractor existe como legado; no es el default para pieza nueva.

## Errores comunes

- Spec generado que no falla nunca.
- Test de Page que reimplementa el service en lugar de mockearlo.

## Referencias

Knowledge: [`../knowledge/dependencies/`](../knowledge/dependencies/)
Ejemplos existentes: `*.page.spec.ts` en varias páginas (muchas son plantilla; al tocar una pieza, endurecer su spec)
Orden con otros templates: se escribe después de api/service/page/widget.
