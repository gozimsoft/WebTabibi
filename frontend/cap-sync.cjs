const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const semverMajor = parseInt(process.versions.node.split('.')[0], 10);
let nodeExe = process.execPath;

// If current node version is < 22, search for installed Node 24+ from NVM
if (semverMajor < 22 && process.env.APPDATA) {
  const nvmDir = path.join(process.env.APPDATA, 'nvm');
  const candidates = ['v24.16.0', 'v24.14.0', 'v22.0.0'];
  for (const ver of candidates) {
    const candidatePath = path.join(nvmDir, ver, 'node.exe');
    if (fs.existsSync(candidatePath)) {
      nodeExe = candidatePath;
      break;
    }
  }
}

const capBin = path.join(__dirname, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor');
const args = process.argv.slice(2);
const result = spawnSync(nodeExe, [capBin, ...args], { stdio: 'inherit', shell: false });
process.exit(result.status ?? 0);
