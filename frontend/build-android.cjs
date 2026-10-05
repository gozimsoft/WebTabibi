const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const androidDir = path.join(projectRoot, 'android');
const task = process.argv[2] || 'assembleRelease';

console.log(`\n==================================================`);
console.log(`🚀 Tabibi Android Build Runner (${task})`);
console.log(`==================================================\n`);

function getJdkMajorVersion(dir) {
  try {
    const releaseFile = path.join(dir, 'release');
    if (fs.existsSync(releaseFile)) {
      const content = fs.readFileSync(releaseFile, 'utf8');
      const match = content.match(/JAVA_VERSION="(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    const javaExe = path.join(dir, 'bin', 'java.exe');
    if (fs.existsSync(javaExe)) {
      const res = spawnSync(javaExe, ['-version'], { encoding: 'utf8' });
      const str = (res.stderr || '') + (res.stdout || '');
      const match = str.match(/version "(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
  } catch (e) {}
  return null;
}

// 1. Detect JAVA_HOME (Prioritize compatible LTS JDKs like 17 or 21, avoid Java 25+)
const candidates = [];

// Check existing environment JAVA_HOME
if (process.env.JAVA_HOME && fs.existsSync(process.env.JAVA_HOME)) {
  candidates.push(process.env.JAVA_HOME);
}

// Check where.exe java
try {
  const whereRes = spawnSync('where.exe', ['java'], { encoding: 'utf8' });
  if (whereRes.stdout) {
    const lines = whereRes.stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.toLowerCase().endsWith('java.exe')) {
        const binDir = path.dirname(line);
        const homeDir = path.dirname(binDir);
        if (fs.existsSync(path.join(binDir, 'java.exe'))) {
          candidates.push(homeDir);
        }
      }
    }
  }
} catch (e) {}

// Common directories
const commonJavaRoots = [
  path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft'),
  path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Eclipse Adoptium'),
  path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Java'),
  'C:\\Program Files\\Microsoft',
  'C:\\Program Files\\Eclipse Adoptium',
  'C:\\Program Files\\Java',
  'C:\\Program Files\\Android\\Android Studio\\jbr',
  'C:\\Program Files (x86)\\Android\\Android Studio\\jbr',
  path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Android Studio', 'jbr')
];

for (const root of commonJavaRoots) {
  if (fs.existsSync(root)) {
    if (fs.existsSync(path.join(root, 'bin', 'java.exe'))) {
      candidates.push(root);
    }
    try {
      const subDirs = fs.readdirSync(root);
      for (const sub of subDirs) {
        const subCandidate = path.join(root, sub);
        if (fs.existsSync(path.join(subCandidate, 'bin', 'java.exe'))) {
          candidates.push(subCandidate);
        }
      }
    } catch (e) {}
  }
}

// Filter and score candidates
let javaHome = null;
let bestScore = -1;

for (const c of candidates) {
  const norm = path.resolve(c);
  const version = getJdkMajorVersion(norm);
  if (!version) continue;

  let score = 0;
  // Gradle 8.x supports Java 17 and 21 perfectly
  if (version === 17) score = 100;
  else if (version === 21) score = 90;
  else if (version > 17 && version <= 24) score = 80;
  else if (version === 11) score = 50;
  else if (version >= 25) {
    // Java 25 (class major version 69) is unsupported by Gradle 8.x
    score = 0;
  }

  if (score > bestScore) {
    bestScore = score;
    javaHome = norm;
  }
}

// 2. Detect ANDROID_HOME / SDK
let sdkDir = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (!sdkDir || !fs.existsSync(sdkDir)) {
  const commonSdkPaths = [
    path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk'),
    path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'Android', 'Sdk'),
    'C:\\Android\\Sdk',
    'D:\\Android\\Sdk'
  ];

  for (const p of commonSdkPaths) {
    if (fs.existsSync(p)) {
      sdkDir = p;
      break;
    }
  }
}

// Check status
if (!javaHome || bestScore <= 0) {
  console.error(`❌ خطأ: لم يتم العثور على إصدار متوافق من Java JDK (17 أو 21).`);
  console.error(`📌 يرجى التأكد من تثبيت OpenJDK 17 LTS أو تعيين متغير JAVA_HOME.`);
  process.exit(1);
}

const detectedVer = getJdkMajorVersion(javaHome);
console.log(`✓ Java JDK: ${javaHome} (Java ${detectedVer})`);

if (sdkDir) {
  console.log(`✓ Android SDK: ${sdkDir}`);
  // Write or update local.properties
  const localPropsPath = path.join(androidDir, 'local.properties');
  const normalizedSdk = sdkDir.replace(/\\/g, '/');
  fs.writeFileSync(localPropsPath, `sdk.dir=${normalizedSdk}\n`, 'utf8');
} else {
  console.warn(`⚠️ تحذير: لم يتم العثور على مجلد Android SDK تلقائياً.`);
  console.warn(`   إذا واجهت خطأ، يرجى فتح Android Studio مرة واحدة لتحميل الـ SDK.`);
}

// Keep gradle.properties org.gradle.java.home in sync with compatible JDK
try {
  const gradlePropsPath = path.join(androidDir, 'gradle.properties');
  if (fs.existsSync(gradlePropsPath)) {
    let content = fs.readFileSync(gradlePropsPath, 'utf8');
    const escapedJavaHome = javaHome.replace(/\\/g, '\\\\');
    if (content.includes('org.gradle.java.home=')) {
      content = content.replace(/org\.gradle\.java\.home=.*/g, `org.gradle.java.home=${escapedJavaHome}`);
    } else {
      content += `\norg.gradle.java.home=${escapedJavaHome}\n`;
    }
    fs.writeFileSync(gradlePropsPath, content, 'utf8');
  }
} catch (e) {}

// 3. Prepare environment
const env = { ...process.env };
env.JAVA_HOME = javaHome;
if (sdkDir) {
  env.ANDROID_HOME = sdkDir;
  env.ANDROID_SDK_ROOT = sdkDir;
}
env.PATH = `${path.join(javaHome, 'bin')}${path.delimiter}${env.PATH}`;

// 4. Run gradlew
const gradlewCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
console.log(`\n⏳ بدء البناء عبر Gradle (${task})...\n`);

const run = spawnSync(gradlewCmd, [task], {
  cwd: androidDir,
  env,
  stdio: 'inherit',
  shell: true
});

if (run.status === 0) {
  console.log(`\n==================================================`);
  console.log(`✅ تم إنشاء التطبيق بنجاح!`);
  if (task === 'assembleRelease') {
    const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    console.log(`📱 مسار ملف الـ APK النهائي:`);
    console.log(`   👉 ${apkPath}`);
  } else if (task === 'bundleRelease') {
    const aabPath = path.join(androidDir, 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
    console.log(`📦 مسار ملف الـ Bundle النهائي:`);
    console.log(`   👉 ${aabPath}`);
  }
  console.log(`==================================================\n`);
} else {
  console.error(`\n❌ فشل أمر البناء (رمز الخروج: ${run.status})`);
}

process.exit(run.status ?? 1);
