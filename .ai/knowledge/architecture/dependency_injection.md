# Inyección de dependencias

## Descripción

Angular DI estándar. No hay GetIt/manual `injection.dart`.

## Responsabilidad

- Servicios de app: `@Injectable({ providedIn: 'root' })` → singleton de aplicación.
- Plugins Cordova en `AppModule.providers`: `StatusBar`, `SplashScreen`.
- Estrategia de rutas: `{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }`.
- Controllers Ionic (`AlertController`, `LoadingController`, `MenuController`, `ModalController`, `ToastController`) se inyectan en Pages cuando hacen falta.

## Servicios raíz relevantes

| Servicio | Responsabilidad |
|---|---|
| `ApiService<T>` | HTTP genérico |
| `PedidoService` | pedidos y detalles |
| `CartService` | carrito reactivo + `localStorage` |
| `UtilService` | guest / menú / iconos |
| `LoaderService` | overlay de carga |
| `DataService` | datos estáticos de plantilla (legado) |

## Reglas de intención

- Un servicio nuevo de dominio se declara `providedIn: 'root'` salvo que deba limitarse a un módulo.
- Pages no instancian `HttpClient` flujos de negocio si ya existe un service (hoy `LoginPage` es excepción).
- No crear una segunda instancia de carrito ni de loader.

## Referencias

- [`README.md`](README.md)
- [`../modules/`](../modules/)
- [`../dependencies/`](../dependencies/)
