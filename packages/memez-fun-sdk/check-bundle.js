const fs = require('fs');
const path = require('path');

// Read the built files
const cjsPath = path.join(__dirname, 'dist/index.js');
const esmPath = path.join(__dirname, 'dist/index.mjs');

const cjsContent = fs.readFileSync(cjsPath, 'utf8');
const esmContent = fs.readFileSync(esmPath, 'utf8');

// Check for direct requires/imports
const cjsImport = `require('@interest-protocol/lib')`;
const esmImport = `from '@interest-protocol/lib'`;

const cjsHasDirectImport = cjsContent.includes(cjsImport);
const esmHasDirectImport = esmContent.includes(esmImport);

console.log('Checking for direct imports:');
console.log(
  `- CJS has direct import: ${cjsHasDirectImport ? 'YES (BAD)' : 'NO (GOOD)'}`
);
console.log(
  `- ESM has direct import: ${esmHasDirectImport ? 'YES (BAD)' : 'NO (GOOD)'}`
);

// Check for lib code being bundled
// Look for some unique strings that would be in the lib code
// This is an approximation - adjust the strings to match your actual lib code
const libCodeSignatures = [
  // Add some strings that would be unique to your lib code
  'lib-specific-function',
  'LibSpecificClass',
  // Add more as needed
];

console.log('\nChecking for bundled lib code:');
let foundLibCode = false;
for (const signature of libCodeSignatures) {
  const inCjs = cjsContent.includes(signature);
  const inEsm = esmContent.includes(signature);
  if (inCjs || inEsm) {
    console.log(`- Found code signature "${signature}": YES (GOOD)`);
    foundLibCode = true;
  }
}

if (!foundLibCode) {
  console.log(
    '- No lib code signatures found. This might indicate the code is not bundled.'
  );

  // If we can't find specific signatures, check if the content is large enough to include bundled code
  const cjsSize = cjsContent.length;
  const esmSize = esmContent.length;
  console.log(`\nFile sizes:`);
  console.log(`- CJS size: ${(cjsSize / 1024).toFixed(2)} KB`);
  console.log(`- ESM size: ${(esmSize / 1024).toFixed(2)} KB`);

  if (cjsSize > 10000 || esmSize > 10000) {
    console.log(
      'Files are reasonably large, which suggests some code is bundled.'
    );
  } else {
    console.log('Files seem small, which might indicate minimal bundling.');
  }
}

console.log('\nOverall assessment:');
if (!cjsHasDirectImport && !esmHasDirectImport) {
  console.log('✅ No direct imports found - this is good!');
  console.log(
    'You should be able to publish without @interest-protocol/lib in your dependencies.'
  );
} else {
  console.log('❌ Direct imports found - the library is not properly bundled.');
  console.log(
    'You need to fix your rollup configuration to properly bundle this dependency.'
  );
}
