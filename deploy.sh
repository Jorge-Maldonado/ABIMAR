#!/bin/bash
set -e

# ⚠️ CONFIGURA TU SUBDIRECTORIO EN GITHUB PAGES:
BASE_HREF="/ABIMAR/"

# 1. Verificar que estés en la rama main
current_branch=$(git symbolic-ref --short HEAD)
if [ "$current_branch" != "main" ]; then
  echo "❌ Debes estar en la rama 'main'. Estás en '$current_branch'."
  exit 1
fi

# 2. Ejecutar build con base href correcto
echo "🔨 Ejecutando build de Ionic (modo producción con base-href)..."
npm run build -- --base-href "$BASE_HREF"

# 3. Verificar que la carpeta www fue creada
if [ ! -d "www" ]; then
  echo "❌ Carpeta 'www' no encontrada después del build. Abortando."
  exit 1
fi

# 4. Corregir rutas relativas en HTML, TS, JS, SCSS...
echo "🛠️ Corrigiendo rutas de 'assets/' en archivos de salida..."

find www -type f -name "*.html" -exec sed -i -E \
  -e "s|(src|href)=[\"'](\.\./)+assets/|\1=\"${BASE_HREF}assets/|g" \
  -e "s|url\((['\"]?)(\.\./)+assets/|url(\1${BASE_HREF}assets/|g" {} +

# 5. Copiar www a carpeta temporal fuera del repo
TMP_DEPLOY="../deploy-www-temp"
echo "📂 Preparando carpeta temporal para deploy: $TMP_DEPLOY"
rm -rf "$TMP_DEPLOY"
mkdir -p "$TMP_DEPLOY"
cp -r www/* "$TMP_DEPLOY"

# 6. Cambiar a la rama gh-pages
echo "🌿 Cambiando a la rama 'gh-pages'..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git checkout gh-pages
else
  echo "🆕 Rama 'gh-pages' no existe, creando..."
  git checkout --orphan gh-pages
  git rm -rf . > /dev/null 2>&1 || true
fi

# 7. Limpiar archivos anteriores
echo "🧹 Limpiando archivos previos en rama 'gh-pages'..."
git rm -rf . > /dev/null 2>&1 || true
rm -rf node_modules www .angular/cache .cache 2>/dev/null || true

# 8. Copiar archivos nuevos desde temporal
echo "📁 Copiando archivos desde carpeta temporal al root de 'gh-pages'..."
cp -r "$TMP_DEPLOY"/* .

# 9. Commit y push
echo "📄 Preparando commit de deploy..."
git add .

if git diff --cached --quiet; then
  echo "⚠️ No hay cambios para commitear."
else
  git commit -m "🚀 Deploy Ionic app to GitHub Pages"
fi

echo "📤 Haciendo push forzado a 'gh-pages' en GitHub..."
git push origin gh-pages --force

# 10. Volver a main y limpiar
echo "🔙 Volviendo a la rama principal (main) y limpiando..."
git reset --hard
git clean -fd
git checkout main

rm -rf "$TMP_DEPLOY"

echo "✅ Deploy completado exitosamente."
echo "🌐 Tu app está disponible en: https://jorge-maldonado.github.io${BASE_HREF}"
