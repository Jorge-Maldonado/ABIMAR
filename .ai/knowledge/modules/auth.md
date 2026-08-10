# Auth (cliente)

## Descripción

Entrada a la app: bienvenida, registro de persona+usuario, login y modo invitado.

## Responsabilidad

| Página | Hace |
|---|---|
| `WelcomePage` | landing brand Abimar Shop; login/signup/guest vía `UtilService` |
| `SignupPage` | crea `persona` + `usuario`; todos los campos requeridos; confirma contraseña; `rolId: 1` |
| `LoginPage` | POST `/login`; guarda sesión; deriva admin por email fijo |

## Componentes clave

- `LoaderService` en login.
- `UtilService` para menú/iconos/guest.
- Token de registro: string aleatorio generado en cliente (`generateToken`), no JWT de sesión.

## Dependencias

- Backend: `/persona/create`, `/usuario/create`, `/login`.
- Navegación: admin → `/admin-home`; resto → `/home`.

## Particularidades

- Login usa `ApiService.url('login')` + `HttpClient` con `observe: 'response'` y `responseType: 'text'` (el body es `"Login correcto, {personalId}"`).
- UX: validación inline, toast + navegación (sin alert bloqueante), opción “Continuar como invitado” → `/home` (explorar; comprar exige login).
- Signup usa `ApiService.url('persona/create')` y `usuario/create`; validación inline; contraseña + confirmación (mín. 6).
- No hay guard de rutas: cualquier URL es alcanzable sin sesión.
- Admin = comparación de email en cliente, no claim del servidor.
- **Sesiones separadas**: cliente usa `usuario`/`personal`/`guestAccess`; admin usa `adminUsuario`/`adminPersonal`. Así un login admin en otra pestaña no pisa el `personal` del checkout.
- Logout admin **no** hace `localStorage.clear()` (preserva carrito y sesión cliente).

## Referencias

- [`../security/`](../security/)
- [`admin.md`](admin.md)
- [`../architecture/navigation_state.md`](../architecture/navigation_state.md)
