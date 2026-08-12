# Auth (cliente)

## Descripción

Entrada a la app: bienvenida, registro de persona+usuario, login, recuperación de contraseña y modo invitado.

## Responsabilidad

| Página | Hace |
|---|---|
| `WelcomePage` | landing brand Abimar Shop; login/signup/guest vía `UtilService` |
| `SignupPage` | crea `persona` + `usuario`; todos los campos requeridos; confirma contraseña; `rolId: 1` |
| `LoginPage` | POST `/login`; guarda sesión; deriva admin por email fijo; enlace a forgot-password |
| `ForgotPasswordPage` | verifica correo + documento + teléfono; POST `/usuario/reset-password`; vuelve a login |

## Componentes clave

- `LoaderService` en login y forgot-password.
- `AuthService.resetPassword` → `ApiService.url('usuario/reset-password')`.
- `UtilService` para menú/iconos/guest.
- Token de registro: string aleatorio generado en cliente (`generateToken`), no JWT de sesión.

## Dependencias

- Backend: `/persona/create`, `/usuario/create`, `/login`, `/usuario/reset-password`.
- Navegación: admin → `/admin-home`; resto → `/home`; reset → `/login`.

## Particularidades

- Login usa `ApiService.url('login')` + `HttpClient` con `observe: 'response'` y `responseType: 'text'` (el body es `"Login correcto, {personalId}"`).
- UX: validación inline, toast + navegación (sin alert bloqueante), opción “Continuar como invitado” → `/home` (explorar; comprar exige login).
- Signup usa `ApiService.url('persona/create')` y `usuario/create`; validación inline; contraseña + confirmación (mín. 6).
- Reset password: identidad local (email + documento + teléfono de `persona` ligada a `usuario.personal`); password nueva hasheada con BCrypt. Errores 401 genéricos (“No se pudo verificar la identidad”).
- `/usuario/update`: si trae password en claro la hashea; si viene vacía no la toca; si ya es BCrypt (`$2a$`/`$2b$`/`$2y$`) no re-hashea.
- No hay guard de rutas: cualquier URL es alcanzable sin sesión.
- Admin = comparación de email en cliente, no claim del servidor.
- **Sesiones separadas**: cliente usa `usuario`/`personal`/`guestAccess`; admin usa `adminUsuario`/`adminPersonal`. Así un login admin en otra pestaña no pisa el `personal` del checkout.
- Logout admin **no** hace `localStorage.clear()` (preserva carrito y sesión cliente).

## Referencias

- [`../security/`](../security/)
- [`admin.md`](admin.md)
- [`../architecture/navigation_state.md`](../architecture/navigation_state.md)
