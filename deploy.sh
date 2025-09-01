#!/bin/bash
set -e

# 1. Verificar que estés en la rama main
current_branch=$(git symbolic-ref --short HEAD)
if [ "$current_branch" != "main" ]; then
  echo "❌ Debes estar en la rama 'main'. Estás en '$current_branch'."
  exit 1
fi

echo "🔨 Ejecutando build de Ionic..."
npm run build

# Verificar que la carpeta www fue creada
if [ ! -d "www" ]; then
  echo "❌ Carpeta 'www' no encontrada después del build. Abortando."
  exit 1
fi

# ✅  Corregir rutas de imágenes/recursos en HTML antes del deploy
echo "🛠️ Corrigiendo rutas relativas en archivos HTML..."
find www -type f -name "*.html" -exec sed -i 's|\.\./\.\./assets/|assets/|g' {} +
find www -type f -name "*.html" -exec sed -i 's|\.\./assets/|assets/|g' {} +

# 2. Copiar www a carpeta temporal fuera del repo (en el mismo nivel que repo)
TMP_DEPLOY="../deploy-www-temp"
echo "📂 Preparando carpeta temporal para deploy: $TMP_DEPLOY"
rm -rf "$TMP_DEPLOY"
mkdir -p "$TMP_DEPLOY"
cp -r www/* "$TMP_DEPLOY"

echo "🌿 Cambiando a la rama 'gh-pages' (creando si no existe)..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git checkout gh-pages
else
  echo "🆕 Rama 'gh-pages' no existe, creando..."
  git checkout --orphan gh-pages
  git rm -rf . > /dev/null 2>&1 || true
fi

echo "🧹 Limpiando archivos previos en rama 'gh-pages'..."
git rm -rf . > /dev/null 2>&1 || true

echo "🚫 Eliminando posibles archivos problemáticos..."
rm -rf node_modules www node_modules .angular/cache .cache 2>/dev/null || true

echo "📁 Copiando archivos desde carpeta temporal al root de 'gh-pages'..."
cp -r "$TMP_DEPLOY"/* .

echo "📄 Preparando commit de deploy..."
git add .

if git diff --cached --quiet; then
  echo "⚠️ No hay cambios para commitear."
else
  git commit -m "🚀 Deploy Ionic app to GitHub Pages"
fi

echo "📤 Haciendo push forzado a 'gh-pages' en GitHub..."
git push origin gh-pages --force

echo "🔙 Volviendo a la rama principal (main) y limpiando..."
git reset --hard
git clean -fd
git checkout main

# Limpiar carpeta temporal
rm -rf "$TMP_DEPLOY"

echo "✅ Deploy completado exitosamente."
echo "🌐 Tu app está disponible en: https://jorge-maldonado.github.io/"
