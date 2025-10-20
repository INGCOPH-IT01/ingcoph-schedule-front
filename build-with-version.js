import { exec } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function buildWithVersion() {
  try {
    console.log('🚀 Starting build with version stamping...');
    
    // Generate version timestamp
    const version = Date.now();
    const versionDate = new Date().toISOString();
    
    console.log(`📦 Build Version: ${version}`);
    console.log(`📅 Build Date: ${versionDate}`);
    
    // Update package.json with build version
    const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
    packageJson.buildVersion = version;
    packageJson.buildDate = versionDate;
    writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
    
    // Run vite build
    console.log('🔨 Building application...');
    await execAsync('npm run build');
    
    // Create version.json in dist folder
    const versionInfo = {
      version,
      buildDate: versionDate,
      timestamp: version
    };
    writeFileSync('./dist/version.json', JSON.stringify(versionInfo, null, 2));
    
    console.log('✅ Build completed successfully!');
    console.log(`📋 Version file created: dist/version.json`);
    console.log(`🌐 Users will automatically get the latest version (${version})`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildWithVersion();

