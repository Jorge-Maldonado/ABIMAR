# Build Android (APK)

Estado del proyecto Ionic 5 + Cordova para generar APK de **Abimar Shop**.

## Veredicto

APK debug / salida:

- `platforms/android/app/build/outputs/apk/debug/abimar.apk`
- copia en raíz del repo: `abimar.apk`

Icono launcher: `resources/icon.png` (marca etiqueta + rayo Abimar). Regenerar densidades: `npm run android:icons`.

Splash nativo: `resources/splash.png` (fondo Dark Tech `#0B0B0D`, logo + “Abimar Shop” + tagline). Densidades: `npm run android:splash`. Preferencias en `config.xml`: `SplashBackgroundColor=#0B0B0D`, `SplashMaintainAspectRatio=true`.

## Checklist

| Ítem | Estado |
|---|---|
| `apiBase` HTTPS (Render) | OK |
| `index.html` + `build:app` (`base-href ./`) | OK |
| Iconos / splash en `resources/` | OK |
| Plugins Cordova básicos | OK en `package.json` |
| `config.xml` → `index.html`, id `com.abimar.shop` | OK |
| `network_security_config` HTTPS | OK |
| Carpeta `platforms/android` | OK (cordova-android 9.1.0) |
| Dependencia `cordova-android` | OK |
| CLI `cordova` local | OK (`cordova@10` + `npx`) |
| `ANDROID_HOME` / SDK | OK (`%LOCALAPPDATA%\Android\Sdk`, API 29) |
| JDK 8 (Cordova 9) | OK (Temurin 8; `scripts/android-build.cmd`) |
| Gradle 6.5.1 | OK |
| Parche jcenter / versioncompare | OK (`scripts/fix-android-repos.js`) |
| AndroidX (File / SocialSharing) | OK (`AndroidXEnabled` + parches en `fix-android-repos.js`) |
| CORS backend (Cordova/APK + web) | OK (orígenes ampliados; redeploy Render) |

## Entorno Windows (ya configurado en el usuario)

| Variable | Valor típico |
|---|---|
| `ANDROID_SDK_ROOT` / `ANDROID_HOME` | `%LOCALAPPDATA%\Android\Sdk` |
| `JAVA_HOME` (build Cordova) | `C:\Program Files\Eclipse Adoptium\jdk-8.0.502.7-hotspot` |
| `GRADLE_HOME` | `%LOCALAPPDATA%\gradle\gradle-6.5.1` |

`npm run android:build` usa `scripts/android-build.cmd` (fija JDK 8 + SDK + parches Gradle).

Si reinstalas el SDK: `npm run android:sdk-setup` (sdkmanager necesita JDK 17+).


## Backend (CORS)

Orígenes permitidos (también en `CorsConfig` + `@CrossOrigin` de `ApiController`):

- `http://localhost:4200` / `:8100` (dev web)
- `http://localhost` / `https://localhost` / `ionic://localhost` (WebView Cordova APK)
- `https://jorge-maldonado.github.io` (GitHub Pages)

Spring Security usa `.cors()` + `CorsConfigurationSource`.

**Hay que redesplegar** el backend en Render para que el APK lo vea.

## Comandos (Windows)

Requisitos: Node 14/16 (mejor), JDK 11 o 17, Android Studio / SDK, variable `ANDROID_HOME`.

> npm 7+ con Angular 10: el repo usa `.npmrc` (`legacy-peer-deps=true`) y `angularx-qrcode@~10.0.12`. `cordova@10` + `cordova-android@9.1.0` están en `devDependencies`; los scripts usan `npx cordova` (no hace falta instalar Cordova global).

```bash
# 1) Instalar deps (incluye cordova + cordova-android)
npm install

# 2) Plataforma (solo una vez)
npm run android:add
# o: ionic cordova platform add android

# 3) Regenerar iconos/splash si cambiaste resources/icon.png
npm run resources

# 4) Build debug APK
npm run android:build
```

APK debug típico:

`platforms/android/app/build/outputs/apk/debug/app-debug.apk`

Release firmado:

```bash
npm run android:apk
```

(requiere keystore y configuración de firma).

## Scripts npm

| Script | Uso |
|---|---|
| `build` | Web / GitHub Pages (`base-href /ABIMAR/`) |
| `build:app` | Web embebida Cordova (`base-href ./`) |
| `android:icons` | Densidades icono desde `resources/icon.png` |
| `android:splash` | Densidades splash desde `resources/splash.png` |
| `android:add` | Agrega plataforma android |
| `android:build` | Compila APK debug `--prod` |
| `android:apk` | Compila release |

## Riesgos en dispositivo

- **Cold start de Render**: primera llamada lenta.
- **PayPal sandbox en WebView Android**: puede fallar o pedir Chrome Custom Tabs; probar en dispositivo real.
- **Google Fonts**: necesitan red; si falla, tipografía cae a sistema.
- **Admin en móvil**: usable pero pensado desktop; el APK de tienda puede incluirlo igual.

## No confundir

`npm run build` (Pages) ≠ build del APK. Para APK usar `android:build` / `ionic cordova build android --prod`.
