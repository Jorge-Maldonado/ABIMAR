/**
 * Parches Cordova Android 9 para builds actuales (jcenter caído).
 * - jcenter() -> mavenCentral()
 * - versioncompare coordenadas nuevas
 * - CordovaLib sin plugins bintray/maven (solo en jcenter)
 */
const fs = require('fs');
const path = require('path');

const androidRoot = path.join(__dirname, '..', 'platforms', 'android');
if (!fs.existsSync(androidRoot)) {
  console.log('[fix-android-repos] platforms/android no existe; omitiendo.');
  process.exit(0);
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.gradle' || entry.name === 'build') continue;
      walk(full, files);
    } else if (entry.name.endsWith('.gradle')) {
      files.push(full);
    }
  }
  return files;
}

let changed = 0;
for (const file of walk(androidRoot)) {
  let content = fs.readFileSync(file, 'utf8');
  const before = content;
  content = content.split('jcenter()').join('mavenCentral()');
  content = content
    .split('import com.g00fy2.versioncompare.Version')
    .join('import io.github.g00fy2.versioncompare.Version');
  content = content
    .split("classpath 'com.g00fy2:versioncompare:1.3.4@jar'")
    .join("classpath 'io.github.g00fy2:versioncompare:1.5.0@jar'");

  if (path.basename(path.dirname(file)) === 'CordovaLib' && path.basename(file) === 'build.gradle') {
    if (content.includes('gradle-bintray-plugin') || content.includes('android-maven-gradle-plugin')) {
      content = content.replace(
        /dependencies\s*\{[\s\S]*?classpath 'com\.jfrog\.bintray\.gradle:gradle-bintray-plugin:[^']+'\s*\}/,
        `dependencies {
        classpath 'com.android.tools.build:gradle:4.0.0'
    }`
      );
      content = content.replace(/apply plugin: 'com\.github\.dcendents\.android-maven'\r?\n/, '');
      content = content.replace(/apply plugin: 'com\.jfrog\.bintray'\r?\n/, '');
      content = content.replace(/\r?\ninstall\s*\{[\s\S]*?\n\}\r?\n/, '\n');
      content = content.replace(/\r?\ntask sourcesJar[\s\S]*?\n\}\r?\n/, '\n');
      content = content.replace(/\r?\nartifacts\s*\{[\s\S]*?\n\}\r?\n/, '\n');
      content = content.replace(/\r?\nbintray\s*\{[\s\S]*?\n\}\r?\n?/, '\n');
    }
  }

  if (content !== before) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log('[fix-android-repos]', path.relative(androidRoot, file));
  }
}

// AndroidX requerido por cordova-plugin-file / x-socialsharing
const gradleProps = path.join(androidRoot, 'gradle.properties');
const templateProps = path.join(__dirname, 'android-gradle.properties');
if (fs.existsSync(templateProps)) {
  fs.copyFileSync(templateProps, gradleProps);
  console.log('[fix-android-repos] gradle.properties → AndroidX=true');
} else if (fs.existsSync(gradleProps)) {
  let props = fs.readFileSync(gradleProps, 'utf8');
  const beforeProps = props;
  props = props
    .replace(/android\.useAndroidX\s*=\s*false/g, 'android.useAndroidX=true')
    .replace(/android\.enableJetifier\s*=\s*false/g, 'android.enableJetifier=true');
  if (!/android\.useAndroidX\s*=/.test(props)) {
    props += '\nandroid.useAndroidX=true\n';
  }
  if (!/android\.enableJetifier\s*=/.test(props)) {
    props += 'android.enableJetifier=true\n';
  }
  if (props !== beforeProps) {
    fs.writeFileSync(gradleProps, props, 'utf8');
    console.log('[fix-android-repos] gradle.properties AndroidX habilitado');
  }
}

// ionic-webview (código fuente) aún usa android.support.*
function patchSupportToAndroidX(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchSupportToAndroidX(full);
      continue;
    }
    if (!entry.name.endsWith('.java') && !entry.name.endsWith('.xml')) continue;
    let content = fs.readFileSync(full, 'utf8');
    const before = content;
    // Solo anotaciones Java. NO tocar FILE_PROVIDER_PATHS (AndroidX sigue usando el nombre support).
    content = content
      .split('android.support.annotation.')
      .join('androidx.annotation.');
    if (content !== before) {
      fs.writeFileSync(full, content, 'utf8');
      console.log('[fix-android-repos] androidx', path.relative(androidRoot, full));
      changed++;
    }
  }
}

/** Evita providers FileProvider duplicados / meta-data incorrecto que crashean al abrir. */
function fixSharingFileProviderManifest() {
  const manifestPath = path.join(androidRoot, 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!fs.existsSync(manifestPath)) return;
  let xml = fs.readFileSync(manifestPath, 'utf8');
  const before = xml;
  // Revertir meta-data mal parcheado
  xml = xml.split('androidx.core.FILE_PROVIDER_PATHS').join('android.support.FILE_PROVIDER_PATHS');

  // Dejar un solo provider de sharing
  const providerRe = /<provider\b[^>]*android:name="nl\.xservices\.plugins\.FileProvider"[^>]*>[\s\S]*?<\/provider>\s*/g;
  const matches = xml.match(providerRe) || [];
  if (matches.length > 1) {
    const keep = `<provider android:authorities="\${applicationId}.sharing.provider" android:exported="false" android:grantUriPermissions="true" android:name="nl.xservices.plugins.FileProvider">
            <meta-data android:name="android.support.FILE_PROVIDER_PATHS" android:resource="@xml/sharing_paths" />
        </provider>
`;
    let first = true;
    xml = xml.replace(providerRe, () => {
      if (first) {
        first = false;
        return keep;
      }
      return '';
    });
  }

  // Asegurar exported en MainActivity (Android 12+)
  if (!/android:name="MainActivity"[^>]*android:exported=/.test(xml)) {
    xml = xml.replace(
      /android:name="MainActivity"/,
      'android:name="MainActivity" android:exported="true"'
    );
  }

  if (xml !== before) {
    fs.writeFileSync(manifestPath, xml, 'utf8');
    console.log('[fix-android-repos] AndroidManifest FileProvider/MainActivity');
    changed++;
  }
}

patchSupportToAndroidX(path.join(androidRoot, 'app', 'src', 'main'));
fixSharingFileProviderManifest();

console.log(`[fix-android-repos] archivos actualizados: ${changed}`);
