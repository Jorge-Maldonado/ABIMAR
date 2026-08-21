/**
 * Regenera src/assets/products/index.json a partir de los archivos
 * presentes en esa carpeta (jpg/png/webp/gif).
 * Lo usa el selector de imagen admin y el build web/APK.
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'assets', 'products');
const indexPath = path.join(dir, 'index.json');
const ext = /\.(jpe?g|png|webp|gif)$/i;

if (!fs.existsSync(dir)) {
  console.error('No existe src/assets/products');
  process.exit(1);
}

const files = fs
  .readdirSync(dir)
  .filter((name) => ext.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

fs.writeFileSync(indexPath, JSON.stringify(files, null, 2) + '\n');
console.log('index.json: ' + files.length + ' imagenes de producto');
