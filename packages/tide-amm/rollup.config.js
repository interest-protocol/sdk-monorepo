const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const replace = require('@rollup/plugin-replace');
const pkg = require('./package.json');

// Get workspace dependencies
const workspaceDeps = Object.keys(pkg.dependencies || {}).filter((dep) =>
  pkg.dependencies[dep].startsWith('workspace:')
);

// Get publishConfig dependencies (which will remain external)
const publishConfigDeps = pkg.publishConfig?.dependencies
  ? Object.keys(pkg.publishConfig.dependencies)
  : [];

// Workspace dependencies to bundle (not in publishConfig)
const depsToBundled = workspaceDeps.filter(
  (dep) => !publishConfigDeps.includes(dep)
);

// All external dependencies
const allExternalDeps = [
  ...Object.keys(pkg.dependencies || {}).filter(
    (dep) => !depsToBundled.includes(dep)
  ),
];

console.log('Workspace dependencies to bundle:', depsToBundled);
console.log('External dependencies:', allExternalDeps);

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: allExternalDeps,
  plugins: [
    // Add replace plugin FIRST to transform problematic patterns
    replace({
      preventAssignment: true,
      values: {
        // Transform common dynamic require patterns
        'require(moduleName)': 'import(moduleName)',
        'require(name)': 'import(name)',
        'require(path)': 'import(path)',
        // Handle specific patterns you might have
        "require('crypto')": "import('crypto')",
        "require('fs')": "import('fs')",
        "require('path')": "import('path')",
        // Environment variables
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      delimiters: ['', ''],
    }),

    resolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
      preserveSymlinks: false,
      preferBuiltins: false,
      exportConditions: ['node', 'default', 'module', 'import'],
    }),

    commonjs({
      transformMixedEsModules: true,
      ignoreDynamicRequires: false,
      requireReturnsDefault: 'auto',
      dynamicRequireTargets: ['node_modules/**/*.js', 'src/**/*.js'],
    }),

    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
    }),
  ],
};
