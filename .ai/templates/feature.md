# Template — Feature

## Objetivo

Definir un área de negocio autocontenida: páginas Ionic lazy, servicios que necesite y su cableado de rutas.

## Cuándo usarlo / cuándo no

**Usarlo** cuando aparece un dominio nuevo con pantallas propias (ej. un flujo de envíos, un panel nuevo).

**No usarlo** si solo se extiende una página existente; si es un helper sin UI (→ [`service.md`](service.md)); si es un modal reutilizable (→ [`widget.md`](widget.md)).

## Responsabilidades

- Acordar pantallas, rutas y servicios del área.
- Construir de abajo hacia arriba: api/service → page(s) → ruta → test.
- Documentar el área en Knowledge `modules/` si es estable.

## Dependencias permitidas

Pages del área → Services existentes o nuevos del área · `Router` · controllers Ionic · `environment` vía services.

## Dependencias prohibidas

URLs hardcodeadas en Pages · Services que importen Pages · inventar repository/usecase/BLoC.

## Entradas

Contrato de API (path relativo a `apiBase`, body, respuesta) · flujos de pantalla · roles (cliente/admin/invitado) si aplica.

## Salidas

```
src/app/<feature>/
  <feature>.module.ts
  <feature>-routing.module.ts
  <feature>.page.ts|html|scss
src/app/services/<feature>.service.ts   # si hay HTTP/estado propio
entrada lazy en AppRoutingModule o child de admin-home
```

## Validaciones

- CodeGraph confirma que no existe ya el mismo feature.
- Ruta lazy registrada y navegable.
- HTTP solo vía service + `apiBase`.
- Menú actualizado solo si el área debe aparecer en shell/admin.

## Convenciones

Ver [`../knowledge/conventions/`](../knowledge/conventions/). Nombres `XxxPage` / `XxxPageModule` / `XxxService`.

## Errores comunes

- Copiar el patrón Flutter `data/domain/presentation`.
- Meter lógica de catálogo en `DataService` legado.
- Registrar la página sin `IonicModule` en el PageModule.

## Referencias

Knowledge: [`../knowledge/modules/`](../knowledge/modules/) · [`../knowledge/architecture/`](../knowledge/architecture/)
Memory: `Decision.ArquitecturaPageService` · `Patron.LazyPageModule`
Ejemplo canónico: `src/app/admin/pedidos/` + `PedidoService`
