const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');

// Get workspace dependencies
const workspaceDeps = Object.keys(pkg.dependencies || {})
  .filter(dep => pkg.dependencies[dep].startsWith('workspace:'));

// Get publishConfig dependencies (which will remain external)
const publishConfigDeps = pkg.publishConfig?.dependencies 
  ? Object.keys(pkg.publishConfig.dependencies) 
  : [];

// Workspace dependencies to bundle (not in publishConfig)
const depsToBundled = workspaceDeps.filter(dep => !publishConfigDeps.includes(dep));

// All external dependencies
const allExternalDeps = [
  ...Object.keys(pkg.dependencies || {}).filter(dep => !depsToBundled.includes(dep))
];

console.log('Workspace dependencies to bundle:', depsToBundled);
console.log('External dependencies:', allExternalDeps);

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true
    }
  ],
  external: allExternalDeps,
  plugins: [
    resolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      // Critical for bundling workspace dependencies
      preserveSymlinks: false
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true
    })
  ]
};
