# Template — Page

## Objetivo

Pantalla Ionic con su `PageModule` lazy, template y orquestación de UI.

## Cuándo usarlo / cuándo no

**Usarlo** al añadir una ruta con UI propia.

**No usarlo** para un trozo reutilizable embebido (→ [`widget.md`](widget.md)); ni para lógica HTTP reutilizable (→ [`service.md`](service.md)).

## Responsabilidades

- Renderizar UI Ionic y manejar interacción.
- Validar formularios en cliente.
- Llamar Services y navegar con `Router` / `NavController`.
- Gestionar loading/alert/toast y liberar loaders en error.

## Dependencias permitidas

Services · `Router` · `ActivatedRoute` · controllers Ionic · `UtilService` para shell · `FormsModule`/`ngModel` según el módulo.

## Dependencias prohibidas

Hosts/URLs absolutas del backend · importar otro PageModule solo para reutilizar lógica (extraer service/widget) · BLoC/Cubit.

## Entradas

Ruta (root o child de `admin-home`) · query params necesarios · services a inyectar · diseño/estados vacíos/error/loading.

## Salidas

```
src/app/<nombre>/
  <nombre>.module.ts          # CommonModule, FormsModule, IonicModule, RoutingModule
  <nombre>-routing.module.ts  # path: '', component: XxxPage
  <nombre>.page.ts
  <nombre>.page.html
  <nombre>.page.scss
  <nombre>.page.spec.ts
```

Registro lazy:

```typescript
{ path: 'nombre', loadChildren: () => import('./nombre/nombre.module').then(m => m.NombrePageModule) }
```

## Validaciones

- CodeGraph: la página/ruta no existe ya.
- `IonicModule` importado en el PageModule.
- HTTP solo vía service + `apiBase`.
- Menú: `ionViewWillEnter` / `UtilService` si debe ocultar shell (login/signup).

## Convenciones

Clase `XxxPage`, selector `app-xxx`. Ver [`../knowledge/conventions/`](../knowledge/conventions/).

## Errores comunes

- Pasar objetos grandes enteros por `queryParams` JSON cuando bastaría un id.
- No hacer `dismiss` del loader en la rama de error.
- Olvidar registrar la ruta en `AppRoutingModule` o en children de admin.

## Referencias

Knowledge: [`../knowledge/ui/`](../knowledge/ui/) · [`../knowledge/architecture/navigation_state.md`](../knowledge/architecture/navigation_state.md)
Memory: `Capa.Page` · `Regla.PageDependeDeService` · `Patron.LazyPageModule`
Ejemplo canónico tienda: `HomePage` · admin: `PedidosPage`
