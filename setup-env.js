#!/usr/bin/env node
/**
 * Environment Setup Script for ModelWhiz Frontend
 * This script helps create the .env.local file for development
 */

const fs = require('fs');
const path = require('path');

function createEnvFile() {
  const envContent = `# Frontend Environment Variables
# Copy this file to .env.local and fill in your values

# API Configuration
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

  const envPath = path.join(__dirname, '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local already exists');
    return;
  }

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
    console.log('📝 Please edit .env.local with your actual configuration values');
  } catch (error) {
    console.error('❌ Failed to create .env.local:', error.message);
  }
}

function main() {
  console.log('🚀 Setting up ModelWhiz Frontend Environment...');
  createEnvFile();
  console.log('🎉 Environment setup complete!');
  console.log('\nNext steps:');
  console.log('1. Edit .env.local with your configuration');
  console.log('2. Run: npm install');
  console.log('3. Run: npm run dev');
}

if (require.main === module) {
  main();
}

module.exports = { createEnvFile };
