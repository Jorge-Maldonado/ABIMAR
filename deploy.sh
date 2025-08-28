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
fi

echo "🧹 Limpiando archivos previos en rama 'gh-pages'..."
git rm -rf . > /dev/null 2>&1 || true

echo "📁 Copiando archivos desde 'www/' al root..."
cp -r www/* .

echo "📄 Preparando deploy: agregando y commiteando cambios si hay..."
git add .

# Solo commit si hay cambios para evitar errores
if ! git diff --cached --quiet; then
  git commit -m "🚀 Deploy Ionic app to GitHub Pages"
else
  echo "⚠️ No hay cambios para commitear."
fi

echo "📤 Haciendo push forzado a 'gh-pages' en GitHub..."
git push origin gh-pages --force

echo "🔙 Volviendo a la rama principal (main)..."
git checkout main

echo "✅ Deploy completado exitosamente."
echo "🌐 Tu app está disponible en: https://jorge-maldonado.github.io/ABIMAR/"
