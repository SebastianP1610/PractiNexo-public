const { spawn } = require('child_process');
const path = require('path');

const viteBin = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
const child = spawn(process.execPath, [viteBin], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: false,
});

child.on('close', (code) => process.exit(code));