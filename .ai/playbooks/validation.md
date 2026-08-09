# Playbook — Validación

Cómo comprobar que un cambio está terminado.
Corresponde al paso 10 de [`../MASTER.md`](../MASTER.md).

---

## Objetivo

Declarar "listo" solo cuando pasan comprobaciones automáticas, arquitectónicas y funcionales mínimas.

## Entradas

Diff del cambio · plan de análisis · templates usados · Knowledge de seguridad/UI si aplica.

## Herramientas utilizadas

CLI del proyecto (`package.json`) · CodeGraph MCP · Memory · Knowledge · navegador/app si hace falta prueba manual.

## Proceso paso a paso

### 1. Comprobación automática

Ejecutar el analizador y la suite de tests que defina el proyecto (scripts en `package.json` / Knowledge dependencies).
Deben pasar enteros. No borrar ni `skip` tests rotos para cerrar la tarea.

### 2. Comprobación de arquitectura

Con CodeGraph y Memory/Knowledge:

- ¿Se respetan las dependencias de capa (Page → Service → HTTP; Service ↛ Page)?
- ¿URLs nuevas salen de la config de entorno / helper canónico?
- ¿Quedó algún llamador de una firma cambiada sin actualizar?
- ¿Se creó un tipo de componente que el catálogo de templates no contempla?

### 3. Comprobación de cableado

Lista mínima genérica (el detalle concreto lo da el template de la pieza):

- [ ] Ruta registrada si hay Page nueva.
- [ ] Service inyectable y usado desde la Page correcta.
- [ ] Módulo Ionic/Angular importa lo necesario (`IonicModule`, routing, etc.).
- [ ] Componentes compartidos declarados donde el framework lo exige.

### 4. Comprobación funcional

Recorrer estados de la UI tocada: carga, vacío, error y camino feliz.
Probar contra el entorno adecuado (dev/sandbox). No validar pagos reales en producción.

### 5. Comprobación de seguridad

Si el cambio toca login, sesión, `localStorage`, pagos o datos personales:
aplicar la checklist de [`../knowledge/security/`](../knowledge/security/).

### 6. Comprobación de interfaz

Estados de feedback (loader/toast/alert) cerrados en error.
Menú/shell coherente con guest vs autenticado si aplica ([`../knowledge/ui/`](../knowledge/ui/)).

## Validaciones

Al cerrar, indicar qué se ejecutó automáticamente y qué se comprobó a mano.
Si algo no se pudo validar, decirlo explícitamente.

## Resultado esperado

Cambio listo para documentar ([`documentation.md`](documentation.md)) o informe de gaps.

## Archivos afectados

Ninguno obligatorio (solo lectura/ejecución), salvo fixes descubiertos en la validación.

## Referencias

[`implementation.md`](implementation.md) · [`../templates/test.md`](../templates/test.md) · [`../knowledge/security/`](../knowledge/security/) · [`../knowledge/dependencies/`](../knowledge/dependencies/)
