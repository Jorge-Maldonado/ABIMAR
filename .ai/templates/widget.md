# Template — Widget (Component)

## Objetivo

Componente Angular/Ionic reutilizable (modal, selector, bloque de UI) sin ser una ruta.

## Cuándo usarlo / cuándo no

**Usarlo** cuando la misma UI se abre o embebe desde más de un sitio, o el bloque tiene ciclo de vida propio (modal).

**No usarlo** si es markup de una sola Page; ni para encapsular llamadas HTTP de dominio (→ service).

## Responsabilidades

- Recibir inputs / emitir outputs o `ModalController.dismiss`.
- Encapsular presentación reutilizable.
- Declararse donde Angular lo requiera (`AppModule` para modales globales, o el módulo consumidor).

## Dependencias permitidas

Ionic/Angular UI · `ModalController` · inputs tipados · assets locales.

## Dependencias prohibidas

Navegación de negocio acoplada a una sola ruta · hosts HTTP · depender de una Page concreta.

## Entradas

API pública del componente (inputs, outputs, roles de dismiss) · dónde se declara.

## Salidas

```
src/app/components/<nombre>/
  <nombre>.component.ts|html|scss
```

```typescript
@Component({ selector: 'app-nombre', ... })
export class NombreComponent { /* inputs / dismiss */ }
```

## Validaciones

- CodeGraph: no existe ya un componente equivalente.
- Declarado en el NgModule correcto (`entryComponents` si el proyecto aún lo exige para modales en Angular 10).
- Sin URLs de backend.

## Convenciones

Selector `app-xxx`. Carpeta bajo `src/app/components/`.

## Errores comunes

- Declarar el componente solo en un PageModule y luego intentar abrirlo como modal global.
- Duplicar el selector.

## Referencias

Knowledge: [`../knowledge/ui/`](../knowledge/ui/)
Ejemplo canónico: `ImageSelectorComponent` (modal desde `ProductosPage`, declarado en `AppModule`)
