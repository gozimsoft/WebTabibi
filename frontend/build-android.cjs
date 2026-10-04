const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const androidDir = path.join(projectRoot, 'android');
const task = process.argv[2] || 'assembleRelease';

console.log(`\n==================================================`);
console.log(`🚀 Tabibi Android Build Runner (${task})`);
console.log(`==================================================\n`);

// 1. Detect JAVA_HOME
let javaHome = process.env.JAVA_HOME;
if (!javaHome || !fs.existsSync(javaHome)) {
  const commonJavaPaths = [
    'C:\\Program Files\\Android\\Android Studio\\jbr',
    'C:\\Program Files (x86)\\Android\\Android Studio\\jbr',
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Android Studio', 'jbr'),
    'C:\\Program Files\\Eclipse Adoptium',
    'C:\\Program Files\\Microsoft',
    'C:\\Program Files\\Java'
  ];

  for (const base of commonJavaPaths) {
    if (fs.existsSync(base)) {
      if (fs.existsSync(path.join(base, 'bin', 'java.exe'))) {
        javaHome = base;
        break;
      }
      // Check subdirectories (e.g. jdk-17...)
      try {
        const subDirs = fs.readdirSync(base);
        for (const sub of subDirs) {
          const candidate = path.join(base, sub);
          if (fs.existsSync(path.join(candidate, 'bin', 'java.exe'))) {
            javaHome = candidate;
            break;
          }
        }
        if (javaHome) break;
      } catch (e) {}
    }
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
if (!javaHome) {
  console.error(`❌ خطأ: لم يتم العثور على Java (JDK).`);
  console.error(`📌 يرجى تثبيت Android Studio الرسمي:`);
  console.error(`   👉 https://developer.android.com/studio`);
  console.error(`   أو تعيين متغير البيئة JAVA_HOME.\n`);
  process.exit(1);
}

console.log(`✓ Java JDK: ${javaHome}`);

if (sdkDir) {
  console.log(`✓ Android SDK: ${sdkDir}`);
  // Write or update local.properties if needed
  const localPropsPath = path.join(androidDir, 'local.properties');
  const normalizedSdk = sdkDir.replace(/\\/g, '/');
  fs.writeFileSync(localPropsPath, `sdk.dir=${normalizedSdk}\n`, 'utf8');
} else {
  console.warn(`⚠️ تحذير: لم يتم العثور على مجلد Android SDK تلقائياً.`);
  console.warn(`   إذا واجهت خطأ، يرجى فتح Android Studio مرة واحدة لتحميل الـ SDK.`);
}

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
