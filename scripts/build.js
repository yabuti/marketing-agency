/**
 * All Things - Unified Production Build & Packaging Script
 * Compiles frontend and admin, then structures httpdocs for 1-click Plesk deployment.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const adminDir = path.join(rootDir, 'admin');
const backendDir = path.join(rootDir, 'backend');
const httpdocsDir = path.join(rootDir, 'httpdocs');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const exists = fs.existsSync(dest);
  const stats = exists && fs.statSync(dest);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log('\x1b[36m%s\x1b[0m', '------------------------------------------------');
console.log('\x1b[36m%s\x1b[0m', '  Building All Things for Production (Plesk)    ');
console.log('\x1b[36m%s\x1b[0m', '------------------------------------------------');

// 1. Build Frontend
console.log('\n[1/3] Compiling Main Website (Frontend)...');
try {
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });
} catch (e) {
  console.error('\x1b[31mFailed to build frontend\x1b[0m');
  process.exit(1);
}

// 2. Build Admin
console.log('\n[2/3] Compiling Admin Panel...');
try {
  execSync('npm run build', { cwd: adminDir, stdio: 'inherit' });
} catch (e) {
  console.error('\x1b[31mFailed to build admin panel\x1b[0m');
  process.exit(1);
}

// 3. Assemble into httpdocs
console.log('\n[3/3] Assembling production build in httpdocs/...');

if (!fs.existsSync(httpdocsDir)) {
  fs.mkdirSync(httpdocsDir, { recursive: true });
}

// Copy Frontend build output to httpdocs root
const frontendBuildDir = path.join(frontendDir, 'build');
if (fs.existsSync(frontendBuildDir)) {
  copyRecursiveSync(frontendBuildDir, httpdocsDir);
  console.log('✓ Frontend static files copied to httpdocs/');
}

// Copy Admin build output to httpdocs/admin
const adminBuildDir = path.join(adminDir, 'build');
const httpdocsAdminDir = path.join(httpdocsDir, 'admin');
if (fs.existsSync(adminBuildDir)) {
  fs.mkdirSync(httpdocsAdminDir, { recursive: true });
  copyRecursiveSync(adminBuildDir, httpdocsAdminDir);
  console.log('✓ Admin panel static files copied to httpdocs/admin/');
}

// Copy Backend files to httpdocs/api
const httpdocsApiDir = path.join(httpdocsDir, 'api');
if (fs.existsSync(backendDir)) {
  fs.mkdirSync(httpdocsApiDir, { recursive: true });
  copyRecursiveSync(backendDir, httpdocsApiDir);
  console.log('✓ PHP API files copied to httpdocs/api/');
}

console.log('\n\x1b[32m%s\x1b[0m', '=======================================================');
console.log('\x1b[32m%s\x1b[0m', '  SUCCESS! Production build assembled in /httpdocs     ');
console.log('\x1b[32m%s\x1b[0m', '  Ready to upload directly to Plesk!                   ');
console.log('\x1b[32m%s\x1b[0m', '=======================================================');
