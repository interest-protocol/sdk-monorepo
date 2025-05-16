#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error(
    'Usage: ts-node scripts/set-up/create-ts-package.ts <directory> <packageName>'
  );
  console.error('  directory:  "packages", "tools", etc.');
  console.error('  packageName: name of the package without scope');
  process.exit(1);
}

const directory = args[0];
const packageName = args[1];
const scope = '@interest-protocol';
const scopedName = `${scope}/${packageName}`;

// Define paths
const rootDir = process.cwd();
const packageDir = path.join(rootDir, directory, packageName);
const jestConfigDir = path.join(rootDir, 'tools', 'jest-config');
const rootTsConfigPath = path.join(rootDir, 'tsconfig.json');

// Check if jest-config exists
if (!fs.existsSync(jestConfigDir)) {
  console.error('Error: tools/jest-config directory does not exist');
  console.error('Please set up the jest-config package first');
  process.exit(1);
}

// Check for templates directory in jest-config
const jestTemplatesDir = path.join(jestConfigDir, 'templates');
const tsConfigSpecTemplate = path.join(jestTemplatesDir, 'tsconfig.spec.json');

// Create it if it doesn't exist
if (!fs.existsSync(jestTemplatesDir)) {
  fs.mkdirSync(jestTemplatesDir, { recursive: true });
  console.log('✅ Created templates directory in jest-config');
}

// Create tsconfig.spec.json template if it doesn't exist
if (!fs.existsSync(tsConfigSpecTemplate)) {
  // Create a more comprehensive tsconfig.spec.json
  const tsConfigSpecContent = {
    extends: './tsconfig.json',
    compilerOptions: {
      types: ['jest', 'node'],
      esModuleInterop: true,
      rootDir: './src', // Changed from '.' to './src'
      noEmit: true, // No need to emit files for tests
    },
    include: ['src/**/*.ts', 'src/**/*.test.ts'], // Only include src directory
    exclude: ['node_modules', 'dist'],
  };

  fs.writeFileSync(
    tsConfigSpecTemplate,
    JSON.stringify(tsConfigSpecContent, null, 2) + '\n'
  );
  console.log(
    '✅ Created tsconfig.spec.json template in jest-config/templates'
  );
}

// Check if package already exists
if (fs.existsSync(packageDir)) {
  console.error(`Package already exists: ${packageDir}`);
  process.exit(1);
}

// Create package directory
console.log(`Creating new TypeScript package: ${scopedName} in ${directory}/`);
fs.mkdirSync(packageDir, { recursive: true });
fs.mkdirSync(path.join(packageDir, 'src'));
// REMOVED: fs.mkdirSync(path.join(packageDir, '__tests__'));

// Create package.json with the provided template
const packageJson = {
  name: scopedName,
  author: 'jose cerqueira',
  files: ['dist'],
  main: './dist/index.js',
  module: './dist/index.mjs',
  types: './dist/index.d.ts',
  exports: {
    '.': {
      source: './src/index.ts',
      import: './dist/index.mjs',
      require: './dist/index.js',
      types: './dist/index.d.ts',
    },
  },
  version: '0.1.0',
  description: `${packageName} package`,
  publishConfig: {
    access: 'public',
  },
  scripts: {
    prebuild: 'rm -rf dist',
    clean: 'rimraf dist && rimraf tsconfig.tsbuildinfo',
    'build:types': 'tsc --project tsconfig.json',
    'build:tsup': "tsup './src/index.ts' --format esm,cjs --sourcemap",
    build: 'pnpm run clean && pnpm run build:tsup && pnpm run build:types',
    dev: 'tsc --watch',
    test: 'jest --no-watchman',
    'test:watch': 'jest --watch --no-watchman',
  },
  keywords: [],
  license: 'ISC',
  devDependencies: {
    '@interest-protocol/prettier-config': 'workspace:*',
    '@interest-protocol/typescript-config': 'workspace:*',
    '@interest-protocol/jest-config': 'workspace:*',
    '@types/jest': '^29.5.5',
    jest: '^29.7.0',
    'jest-environment-node': '^29.7.0',
    'ts-jest': '^29.1.1',
    'ts-node': '^10.9.1',
    rimraf: '^5.0.1',
    tsup: '^8.3.6',
  },
  dependencies: {},
};

// Write package.json
fs.writeFileSync(
  path.join(packageDir, 'package.json'),
  JSON.stringify(packageJson, null, 2) + '\n'
);
console.log('✅ Created package.json');

// Create tsconfig.json with the provided template
const tsConfig = {
  extends: '@interest-protocol/typescript-config/base.json',
  compilerOptions: {
    target: 'ESNext',
    lib: ['esnext'],
    module: 'esnext',
    declaration: true,
    emitDeclarationOnly: true,
    allowJs: true,
    sourceMap: true,
    allowSyntheticDefaultImports: true,
    rootDir: './src',
    outDir: './dist',
    moduleResolution: 'node',
    declarationMap: true,
    composite: true,
    forceConsistentCasingInFileNames: true,
    baseUrl: '.',
  },
  include: ['src/**/*.ts'],
  exclude: ['node_modules', 'dist', '**/*.test.ts'],
  references: [{ path: './tsconfig.spec.json' }],
};

// REMOVED: Create __tests__/tsconfig.json

const jestSetupContent = `// jest-setup.ts
import '@testing-library/jest-dom';
`;

fs.writeFileSync(path.join(packageDir, 'jest-setup.ts'), jestSetupContent);
console.log('✅ Created jest-setup.ts');

fs.writeFileSync(
  path.join(packageDir, 'tsconfig.json'),
  JSON.stringify(tsConfig, null, 2) + '\n'
);
console.log('✅ Created tsconfig.json');

// Copy tsconfig.spec.json from template
fs.copyFileSync(
  tsConfigSpecTemplate,
  path.join(packageDir, 'tsconfig.spec.json')
);
console.log('✅ Copied tsconfig.spec.json from template');

// Create jest.config.js with proper test paths
const jestConfig = `/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/*.test.ts'],
};

module.exports = config;
`;

fs.writeFileSync(path.join(packageDir, 'jest.config.js'), jestConfig);
console.log('✅ Created jest.config.js with src test paths');

// Create global test types file
const globalTestTypesContent = `// global.d.ts
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      // Add any custom matchers you're using
    }
  }
}

export {};
`;

fs.mkdirSync(path.join(packageDir, 'types'), { recursive: true });
fs.writeFileSync(
  path.join(packageDir, 'types', 'global.d.ts'),
  globalTestTypesContent
);
console.log('✅ Created global test types file');

// Create a simplified sample index file with just add function
const indexContent = `/**
 * ${packageName} module
 * @module ${packageName}
 */

/**
 * Adds two numbers together
 * @param a - First number
 * @param b - Second number
 * @returns The sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}
`;

fs.writeFileSync(path.join(packageDir, 'src', 'index.ts'), indexContent);
console.log('✅ Created src/index.ts');

// Create a simplified sample test file
const testContent = `import { add } from './index';

describe('add function', () => {
  it('adds two positive numbers correctly', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('handles negative numbers', () => {
    expect(add(5, -3)).toBe(2);
    expect(add(-5, -3)).toBe(-8);
  });

  it('handles zero', () => {
    expect(add(0, 5)).toBe(5);
    expect(add(5, 0)).toBe(5);
  });
});
`;

// ONLY create the test file in src directory
fs.writeFileSync(path.join(packageDir, 'src', 'index.test.ts'), testContent);
console.log('✅ Created src/index.test.ts');

// Add README.md
fs.writeFileSync(
  path.join(packageDir, 'README.md'),
  `# ${scopedName}

${packageName} package for Interest Protocol.

## Installation

\`\`\`bash
pnpm add ${scopedName}
\`\`\`

## Usage

\`\`\`typescript
import { add } from '${scopedName}';

// Basic operation
console.log(add(5, 3));  // 8
\`\`\`
`
);
console.log('✅ Created README.md');

// Update root tsconfig.json to add reference to the new package
if (fs.existsSync(rootTsConfigPath)) {
  try {
    // Read the file content directly to preserve formatting
    let rootTsConfigContent = fs.readFileSync(rootTsConfigPath, 'utf8');

    // Parse the content to check if the reference already exists
    const rootTsConfig = JSON.parse(rootTsConfigContent);

    // Only proceed if we're adding to packages directory
    if (directory === 'packages') {
      // Check if the reference already exists
      const packagePath = `./${directory}/${packageName}`;
      const referenceExists =
        rootTsConfig.references &&
        rootTsConfig.references.some(
          (ref: { path: string }) => ref.path === packagePath
        );

      if (!referenceExists) {
        // If the reference doesn't exist, add it
        if (!rootTsConfig.references) {
          // If references array doesn't exist at all
          rootTsConfigContent = rootTsConfigContent.replace(
            '{',
            '{\n  "files": [],\n  "references": [\n    { "path": "' +
              packagePath +
              '" }\n  ]'
          );
        } else if (rootTsConfig.references.length === 0) {
          // If references array exists but is empty
          rootTsConfigContent = rootTsConfigContent.replace(
            '"references": []',
            '"references": [\n    { "path": "' + packagePath + '" }\n  ]'
          );
        } else {
          // If references array exists and has items, add to the end
          const lastBracketPos = rootTsConfigContent.lastIndexOf(']');
          const insertText =
            lastBracketPos > 0
              ? ',\n    { "path": "' + packagePath + '" }'
              : '{ "path": "' + packagePath + '" }';

          rootTsConfigContent =
            rootTsConfigContent.substring(0, lastBracketPos) +
            insertText +
            rootTsConfigContent.substring(lastBracketPos);
        }

        // Write the updated content back
        fs.writeFileSync(rootTsConfigPath, rootTsConfigContent);
        console.log(
          `✅ Updated root tsconfig.json with reference to ${packagePath}`
        );
      } else {
        console.log(
          `ℹ️ Reference to ${packagePath} already exists in root tsconfig.json`
        );
      }
    } else {
      console.log(
        `ℹ️ Not adding reference to root tsconfig.json for directory: ${directory}`
      );
    }
  } catch (error) {
    console.error('⚠️ Failed to update root tsconfig.json:', error);
  }
} else {
  console.error(
    '⚠️ Root tsconfig.json not found. Could not add reference to the new package.'
  );
}

try {
  console.log('\n📦 Installing dependencies...');

  // Execute pnpm install with the filter flag
  execSync(`pnpm install --filter ${scopedName}`, { stdio: 'inherit' });

  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error);
}

// Display success message with next steps
console.log('\n🎉 Package created successfully!');
console.log('\nNext steps:');
console.log(`  1. cd ${directory}/${packageName}`);
console.log('  2. Start developing your package');
console.log('  3. Run tests with: pnpm test');
console.log('  4. Build with: pnpm build');
