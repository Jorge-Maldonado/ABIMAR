# Seguridad

## Descripción

Modelo de autenticación y almacenamiento de sesión actuales. No es un esquema bancario ni OAuth.

## Autenticación

1. Cliente envía `{ emailUser, password }` a `POST .../login`.
2. Respuesta texto HTTP 200: `"Login correcto, <personalId>"`.
3. Front guarda `usuario`, `personal`, `guestAccess=false` en `localStorage`.
4. Si email === `jorge.maldonado@hotmail.com` → redirige a admin.

401 → credenciales inválidas. Sin refresh token ni expiración gestionada en cliente.

## Autorización

- Sin `CanActivate` / guards en el router.
- Admin por email hardcodeado en `LoginPage`.
- Roles existen en backend (`/rol/*`) y se asignan a personas, pero el front no los usa para proteger rutas.

## Almacenamiento

| Dato | Dónde | Riesgo |
|---|---|---|
| Email / personalId | `localStorage` | XSS puede leer sesión |
| Carrito | `localStorage` | no sensible |
| `pedidoId` | `localStorage` | manipulable |
| Password | solo en tránsito al login/signup | signup la manda en claro al API |
| Token de usuario (registro) | generado en cliente y guardado en backend | no es sesión JWT del app |

No hay cifrado local de contraseñas ni biometric storage.

## Pagos

- PayPal sandbox en cliente.
- QR es representación visual; la verdad de pago es el `status` del pedido en backend (actualizable también desde admin).

## Intención recomendada (aún no implementada)

- Centralizar auth en un service.
- Guards por rol.
- Dejar de decidir admin por email literal.
- Preferir `environment.apiBase` y evitar secretos en repo/README.

## Referencias

- [`../modules/auth.md`](../modules/auth.md)
- [`../modules/admin.md`](../modules/admin.md)
- [`../architecture/network.md`](../architecture/network.md)
