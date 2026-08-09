# Template — Service

## Objetivo

Encapsular HTTP, estado local o helpers de UI en un servicio Angular reutilizable.

## Cuándo usarlo / cuándo no

**Usarlo** cuando dos o más pages necesiten la misma lógica, o cuando una page haría HTTP/estado que debe vivir fuera de la vista.

**No usarlo** para una transformación trivial usada en un solo template; ni para sustituir un componente visual (→ [`widget.md`](widget.md)).

## Responsabilidades

- Exponer métodos claros (`listar`, `create`, `add`, `show`…).
- Ocultar detalles de URL, headers y persistencia.
- Ser inyectable como singleton de app salvo justificación.

## Dependencias permitidas

`HttpClient` · `ApiService` · `environment` · RxJS · `localStorage` cuando el dominio lo requiere (carrito/sesión) · controllers Ionic solo en services de UI (`LoaderService`).

## Dependencias prohibidas

Importar Pages · construir vistas · hardcodear hosts · crear una segunda instancia del mismo dominio (segundo carrito, segundo loader).

## Entradas

Contrato de operaciones · dependencias a inyectar · si persiste estado y dónde.

## Salidas

```typescript
@Injectable({ providedIn: 'root' })
export class XxxService {
  constructor(private http: HttpClient /* o ApiService */) {}
  // métodos que devuelven Observable o mutan estado interno
}
```

Ubicación: `src/app/services/xxx.service.ts` o `src/app/services/ui/` para UI.

## Validaciones

- `providedIn: 'root'` (o scope explícito documentado).
- CodeGraph: no existe ya un service equivalente.
- Ninguna referencia a `*.page`.
- URLs vía `apiBase` / `ApiService.url`.

## Convenciones

Nombre `XxxService`. Memory: `Convencion.UbicacionServicios` · `Regla.ServiciosProvidedInRoot` · `Regla.ServiceNoDependeDePage`.

## Errores comunes

- Meter el HTTP en la Page “por rapidez” (login es deuda, no plantilla).
- Service que conoce rutas de navegación de negocio (salvo helpers de shell muy justificados).

## Referencias

Knowledge: [`../knowledge/architecture/dependency_injection.md`](../knowledge/architecture/dependency_injection.md)
Ejemplos canónicos: `CartService` (estado) · `PedidoService` (HTTP de dominio) · `LoaderService` (UI) · `ApiService` (HTTP genérico)
