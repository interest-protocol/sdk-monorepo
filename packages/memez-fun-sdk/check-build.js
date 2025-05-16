const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build output...');

// Check if build files exist
const requiredFiles = [
  'dist/index.js',
  'dist/index.mjs',
  'dist/index.d.ts'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.resolve(__dirname, file))) {
    console.error(`❌ Required file ${file} is missing!`);
    process.exit(1);
  }
}

console.log('✅ All required build files exist');

// Check workspace dependencies bundling
try {
  // Read the output files
  const cjsOutput = fs.readFileSync(path.resolve(__dirname, 'dist/index.js'), 'utf8');
  const esmOutput = fs.readFileSync(path.resolve(__dirname, 'dist/index.mjs'), 'utf8');
  
  // Get package info
  const pkg = require('./package.json');
  
  // Get workspace dependencies
  const workspaceDeps = Object.keys(pkg.dependencies || {})
    .filter(dep => pkg.dependencies[dep].startsWith('workspace:'));
  
  // Get published dependencies from publishConfig
  const publishedDeps = pkg.publishConfig?.dependencies 
    ? Object.keys(pkg.publishConfig.dependencies)
    : [];
  
  // Workspace dependencies to bundle (not in publishConfig)
  const depsToBundle = workspaceDeps.filter(dep => !publishedDeps.includes(dep));
  
  // Workspace dependencies to keep external (in publishConfig)
  const depsToKeepExternal = workspaceDeps.filter(dep => publishedDeps.includes(dep));
  
  console.log('\n📦 Workspace dependencies:');
  console.log('- Dependencies to bundle:', depsToBundle);
  console.log('- Dependencies to keep external:', depsToKeepExternal);
  
  // Check bundled dependencies
  let allCorrect = true;
  
  if (depsToBundle.length > 0) {
    console.log('\n🔍 Checking dependencies that should be bundled:');
    
    for (const dep of depsToBundle) {
      const cjsImport = `require('${dep}')`;
      const esmImport = `from '${dep}'`;
      
      const cjsBundled = !cjsOutput.includes(cjsImport);
      const esmBundled = !esmOutput.includes(esmImport);
      
      console.log(`${dep}:`);
      console.log(`  - Bundled in CJS: ${cjsBundled ? '✅' : '❌'}`);
      console.log(`  - Bundled in ESM: ${esmBundled ? '✅' : '❌'}`);
      
      if (!cjsBundled || !esmBundled) {
        allCorrect = false;
      }
    }
  }
  
  // Check external dependencies (only if they appear in the output)
  if (depsToKeepExternal.length > 0) {
    console.log('\n🔍 Checking dependencies that should be kept external:');
    
    for (const dep of depsToKeepExternal) {
      // Only check if the dependency is actually used
      if (cjsOutput.includes(dep) || esmOutput.includes(dep)) {
        const cjsImport = `require('${dep}')`;
        const esmImport = `from '${dep}'`;
        
        const cjsExternal = cjsOutput.includes(cjsImport);
        const esmExternal = esmOutput.includes(esmImport);
        
        console.log(`${dep}:`);
        console.log(`  - External in CJS: ${cjsExternal ? '✅' : '❌'}`);
        console.log(`  - External in ESM: ${esmExternal ? '✅' : '❌'}`);
        
        // If it's used but not external, that's an error
        if ((cjsOutput.includes(dep) && !cjsExternal) || 
            (esmOutput.includes(dep) && !esmExternal)) {
          allCorrect = false;
        }
      } else {
        console.log(`${dep}: ⚠️ Not used in the output`);
      }
    }
  }
  
  console.log('\n📊 Check results:');
  if (allCorrect) {
    console.log('✅ All workspace dependencies are handled correctly!');
  } else {
    console.error('❌ Some workspace dependencies are not handled correctly!');
    process.exit(1);
  }
  
  // Check type declarations
  const typesFile = fs.readFileSync(path.resolve(__dirname, 'dist/index.d.ts'), 'utf8');
  if (typesFile.trim() === '') {
    console.error('❌ Type declarations file is empty!');
    process.exit(1);
  }
  
  console.log('✅ Type declarations are generated');
  console.log('\n🎉 Build verification completed successfully!');
  
} catch (error) {
  console.error('❌ Error checking build:', error);
  process.exit(1);
}
