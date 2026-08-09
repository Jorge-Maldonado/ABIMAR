# Auth (cliente)

## Descripción

Entrada a la app: bienvenida, registro de persona+usuario, login y modo invitado.

## Responsabilidad

| Página | Hace |
|---|---|
| `WelcomePage` | landing; puede marcar guest vía `UtilService` |
| `SignupPage` | crea `persona` + `usuario` (login) en backend; `rolId: 1` |
| `LoginPage` | POST `/login`; guarda sesión; deriva admin por email fijo |

## Componentes clave

- `LoaderService` en login.
- `UtilService` para menú/iconos/guest.
- Token de registro: string aleatorio generado en cliente (`generateToken`), no JWT de sesión.

## Dependencias

- Backend: `/persona/create`, `/usuario/create`, `/login`.
- Navegación: admin → `/admin-home`; resto → `/home`.

## Particularidades

- Login no usa `ApiService`.
- No hay guard de rutas: cualquier URL es alcanzable sin sesión.
- Admin = comparación de email en cliente, no claim del servidor.

## Referencias

- [`../security/`](../security/)
- [`admin.md`](admin.md)
- [`../architecture/navigation_state.md`](../architecture/navigation_state.md)
