#!/usr/bin/env node
/**
 * ModelWhiz Frontend Setup Script
 * This script helps set up the frontend environment and dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '🔄';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

function runCommand(command, description) {
    log(`Running: ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        log(`${description} completed successfully`, 'success');
        return true;
    } catch (error) {
        log(`${description} failed: ${error.message}`, 'error');
        return false;
    }
}

function checkNodeVersion() {
    log('Checking Node.js version...');
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    
    if (major < 18) {
        log(`Node.js 18+ is required. Current version: ${version}`, 'error');
        return false;
    }
    
    log(`Node.js ${version} is compatible`, 'success');
    return true;
}

function checkNpm() {
    log('Checking npm availability...');
    try {
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        log(`npm ${npmVersion} is available`, 'success');
        return true;
    } catch (error) {
        log('npm is not available', 'error');
        return false;
    }
}

function installDependencies() {
    log('Installing dependencies...');
    
    // Check if node_modules exists
    if (fs.existsSync('node_modules')) {
        log('node_modules already exists, skipping installation', 'warning');
        return true;
    }
    
    return runCommand('npm install', 'Installing npm dependencies');
}

function createEnvFile() {
    log('Setting up environment configuration...');
    
    const envFile = '.env.local';
    const envExample = 'env.example';
    
    if (fs.existsSync(envFile)) {
        log('.env.local file already exists', 'success');
        return true;
    }
    
    if (fs.existsSync(envExample)) {
        log('Creating .env.local from template...');
        try {
            fs.copyFileSync(envExample, envFile);
            log('.env.local file created successfully', 'success');
            log('Please edit .env.local file with your configuration', 'warning');
            return true;
        } catch (error) {
            log(`Failed to create .env.local file: ${error.message}`, 'error');
            return false;
        }
    } else {
        log('No env.example found. Creating basic .env.local file...');
        try {
            const envContent = `# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_ASSET_BASE_URL=http://localhost:8000

# Supabase Configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true

# External Services
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
`;
            
            fs.writeFileSync(envFile, envContent);
            log('Basic .env.local file created successfully', 'success');
            log('Please edit .env.local file with your configuration', 'warning');
            return true;
        } catch (error) {
            log(`Failed to create .env.local file: ${error.message}`, 'error');
            return false;
        }
    }
}

function checkBackendConnection() {
    log('Checking backend connection...');
    
    // This is a basic check - in a real scenario you might want to make an actual HTTP request
    log('Backend connection check skipped (requires backend to be running)', 'warning');
    return true;
}

function runLint() {
    log('Running linting check...');
    return runCommand('npm run lint', 'Linting check');
}

function buildCheck() {
    log('Checking if the project can build...');
    return runCommand('npm run build', 'Build check');
}

function main() {
    log('🚀 ModelWhiz Frontend Setup');
    console.log('='.repeat(40));
    
    // Check Node.js version
    if (!checkNodeVersion()) {
        process.exit(1);
    }
    
    // Check npm
    if (!checkNpm()) {
        process.exit(1);
    }
    
    // Install dependencies
    if (!installDependencies()) {
        log('Failed to install dependencies', 'error');
        process.exit(1);
    }
    
    // Create environment file
    if (!createEnvFile()) {
        log('Failed to create environment file', 'error');
        process.exit(1);
    }
    
    // Check backend connection
    if (!checkBackendConnection()) {
        log('Backend connection check failed', 'error');
        process.exit(1);
    }
    
    // Run linting
    if (!runLint()) {
        log('Linting check failed', 'warning');
        log('You can fix linting issues later with: npm run lint', 'info');
    }
    
    // Build check
    if (!buildCheck()) {
        log('Build check failed', 'error');
        process.exit(1);
    }
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Edit .env.local file with your configuration');
    console.log('2. Ensure backend is running on http://localhost:8000');
    console.log('3. Start development server: npm run dev');
    console.log('4. Open http://localhost:3000 in your browser');
    console.log('\nFor more information, see README.md');
}

if (require.main === module) {
    main();
}

module.exports = { main };
