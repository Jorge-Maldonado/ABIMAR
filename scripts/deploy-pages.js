/**
 * Publica www/ a la rama gh-pages sin el paquete `gh-pages`.
 * En Windows ese paquete hace `git rm` con cientos de rutas y falla
 * (spawn ENAMETOOLONG) por la carpeta larga del proyecto.
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const www = path.join(root, 'www');
const tmp = path.join(os.tmpdir(), 'abimar-gh-pages');

function die(msg, code) {
  console.error(msg);
  process.exit(code == null ? 1 : code);
}

function git(args, cwd, allowFail) {
  const r = spawnSync('git', args, {
    cwd: cwd || root,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (r.status !== 0 && !allowFail) {
    const err = (r.stderr || r.stdout || '').trim() || `git ${args.join(' ')}`;
    die(err);
  }
  return r;
}

if (!fs.existsSync(path.join(www, 'index.html'))) {
  die('No existe www/index.html. Corre primero: npm run build');
}

fs.writeFileSync(path.join(www, '.nojekyll'), '');

const remote = execSync('git remote get-url origin', {
  cwd: root,
  encoding: 'utf8',
}).trim();
if (!remote) {
  die('No hay remote origin.');
}

const userEmail =
  git(['config', 'user.email'], root, true).stdout.trim() || 'deploy@abimar.local';
const userName =
  git(['config', 'user.name'], root, true).stdout.trim() || 'ABIMAR deploy';

console.log('Publicando GitHub Pages desde', www);
console.log('Cache corta:', tmp);

fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });

const clone = git(['clone', '--depth', '1', '--branch', 'gh-pages', remote, tmp], root, true);
if (clone.status !== 0) {
  fs.rmSync(tmp, { recursive: true, force: true });
  git(['clone', '--depth', '1', remote, tmp]);
  git(['checkout', '--orphan', 'gh-pages'], tmp);
}

for (const entryName of fs.readdirSync(tmp)) {
  if (entryName === '.git') continue;
  fs.rmSync(path.join(tmp, entryName), { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

copyDir(www, tmp);

git(['config', 'user.email', userEmail], tmp);
git(['config', 'user.name', userName], tmp);
git(['add', '-A'], tmp);

const dirty = git(['status', '--porcelain'], tmp);
if (!dirty.stdout.trim()) {
  console.log('No hay cambios respecto a gh-pages.');
  process.exit(0);
}

git(['commit', '-m', 'Deploy GitHub Pages'], tmp);
git(['push', 'origin', 'HEAD:gh-pages', '--force'], tmp);

console.log('Listo: https://jorge-maldonado.github.io/ABIMAR/');
