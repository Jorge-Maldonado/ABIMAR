# Template — State (reactivo)

## Objetivo

Exponer estado compartido con `BehaviorSubject` (y persistencia opcional) sin introducir NgRx/BLoC.

## Cuándo usarlo / cuándo no

**Usarlo** cuando varias Pages deben reaccionar al mismo estado (carrito, flags de menú/guest).

**No usarlo** para estado local de una sola Page (propiedades de clase bastan); ni para inventar un store global “por si acaso”.

## Responsabilidades

- Mantener un subject privado y exponer `Observable` / getters.
- Decidir qué se persiste en `localStorage` y bajo qué clave.
- Ofrecer mutadores explícitos (`add`, `setGuest`, `limpiar`…).

## Dependencias permitidas

RxJS · `localStorage` · tipos del dominio. Suele vivir **dentro** de un Service ([`service.md`](service.md)).

## Dependencias prohibidas

Pages suscritas que reescriban la misma clave de `localStorage` por fuera del service · NgRx/Akita sin decisión · estado de pedido de pago duplicado en varios sitios sin dueño.

## Entradas

Forma del estado · claves de persistencia · quién puede mutar.

## Salidas

```typescript
private readonly subject = new BehaviorSubject<T>(initial);
readonly state$ = this.subject.asObservable();
get snapshot(): T { return this.subject.value; }
private persist(next: T) { /* localStorage + subject.next */ }
```

## Validaciones

- Un solo dueño del estado.
- Las Pages solo llaman mutadores del service.
- Memory: `Patron.BehaviorSubjectLocal` · `Regla.CarritoSoloViaCartService` · `Regla.FlagsShellViaUtilService`.

## Convenciones

Claves conocidas: `carrito`, `guestAccess`, `usuario`, `personal`, `pedidoId`. No añadir datos sensibles nuevos a `localStorage` sin decisión.

## Errores comunes

- Suscribirse en la Page y también mutar `localStorage` a mano.
- Olvidar emitir tras persistir.

## Referencias

Knowledge: [`../knowledge/architecture/navigation_state.md`](../knowledge/architecture/navigation_state.md)
Ejemplos canónicos: `CartService` · `UtilService`
