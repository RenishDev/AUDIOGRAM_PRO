#!/usr/bin/env node

/**
 * AudiogramPro Offline - One-Click Setup & Run Script
 * This script installs dependencies, starts the dev server, and opens the browser
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';
const projectRoot = __dirname;

console.log('\n' + '='.repeat(70));
console.log('🎉 AudiogramPro Offline - One-Click Setup & Run');
console.log('='.repeat(70) + '\n');

/**
 * Run a command and return a promise
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: isWindows,
      ...options
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Check if node_modules exists and has required packages
 */
function hasNodeModules() {
  const modulesPath = path.join(projectRoot, 'node_modules');
  const nextPath = path.join(modulesPath, 'next');
  return fs.existsSync(nextPath);
}

/**
 * Open browser to localhost:9002
 */
function openBrowser() {
  const url = 'http://localhost:9002';
  const start = isWindows ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  
  setTimeout(() => {
    console.log(`\n🌐 Opening browser to ${url}...\n`);
    spawn(start, [url], { stdio: 'ignore' });
  }, 3000);
}

/**
 * Main execution
 */
async function main() {
  try {
    // Step 1: Check if node_modules exists
    console.log('✅ Step 1: Checking dependencies...\n');
    
    if (!hasNodeModules()) {
      console.log('⚠️  node_modules not found. Installing dependencies...\n');
      try {
        await runCommand('npm', ['install', '--omit=optional']);
        console.log('\n✅ Dependencies installed!\n');
      } catch (error) {
        console.log('⚠️  npm install had issues, continuing anyway...\n');
      }
    } else {
      console.log('✅ Dependencies already installed!\n');
    }

    // Step 2: Start dev server
    console.log('✅ Step 2: Starting development server...\n');
    console.log('📝 Starting Next.js on port 9002...\n');
    
    // Open browser after delay
    openBrowser();

    // Start the dev server (this will run indefinitely)
    await runCommand('npm', ['run', 'dev']);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
