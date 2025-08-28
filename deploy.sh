#!/bin/bash
set -e

# Verificar que estés en la rama main
current_branch=$(git symbolic-ref --short HEAD)
if [ "$current_branch" != "main" ]; then
  echo "❌ Debes estar en la rama 'main'. Estás en '$current_branch'."
  exit 1
fi

echo "🔨 Ejecutando build de Ionic..."
npm run build

echo "🌿 Cambiando a la rama 'gh-pages' (creando si no existe)..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git checkout gh-pages
else
  git checkout --orphan gh-pages
  git rm -rf . > /dev/null 2>&1 || true
fi

echo "🧹 Limpiando archivos previos en rama 'gh-pages'..."
git rm -rf . > /dev/null 2>&1 || true

echo "🚫 Eliminando posibles archivos problemáticos de caché y node_modules..."
rm -rf node_modules www/node_modules .angular/cache .cache 2>/dev/null || true

echo "📁 Copiando archivos desde 'www/' al root de gh-pages..."
cp -r www/* .

echo "📄 Preparando deploy: agregando y commiteando cambios si hay..."
git add .

if git diff --cached --quiet; then
  echo "⚠️ No hay cambios para commitear."
else
  git commit -m "🚀 Deploy Ionic app to GitHub Pages" || true
fi

echo "📤 Haciendo push forzado a 'gh-pages' en GitHub..."
git push origin gh-pages --force

echo "🔙 Volviendo a la rama principal (main), descartando TODOS los cambios locales..."
git reset --hard
git clean -fd
git checkout main

echo "✅ Deploy completado exitosamente."
echo "🌐 Tu app está disponible en: https://jorge-maldonado.github.io/ABIMAR/"
