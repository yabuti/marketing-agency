/**
 * All Things - Unified Dev Server Runner
 * Runs PHP Backend (port 5000), Frontend Website (port 3000), and Admin Panel (port 3001).
 */
const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log('\x1b[36m%s\x1b[0m', '   Starting All Things Full-Stack Services...   ');
console.log('\x1b[36m%s\x1b[0m', '================================================');

function startProcess(name, command, args, cwd, color, env = {}) {
  const proc = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, ...env },
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line.trim()) console.log(`${color}[${name}]\x1b[0m ${line}`);
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line.trim()) console.log(`${color}[${name} ERR]\x1b[0m ${line}`);
    });
  });

  proc.on('close', (code) => {
    console.log(`${color}[${name}]\x1b[0m exited with code ${code}`);
  });

  return proc;
}

// 1. PHP Backend on port 5000
const backend = startProcess(
  'BACKEND',
  'php',
  ['-S', 'localhost:5000', '-t', 'backend'],
  rootDir,
  '\x1b[35m'
);

// 2. React Frontend on port 3000
const frontend = startProcess(
  'FRONTEND',
  'npm',
  ['start'],
  path.join(rootDir, 'frontend'),
  '\x1b[32m',
  { PORT: '3000' }
);

// 3. React Admin Panel on port 3001
const admin = startProcess(
  'ADMIN',
  'npm',
  ['start'],
  path.join(rootDir, 'admin'),
  '\x1b[33m',
  { PORT: '3001' }
);

process.on('SIGINT', () => {
  console.log('\nStopping all services...');
  backend.kill();
  frontend.kill();
  admin.kill();
  process.exit();
});
