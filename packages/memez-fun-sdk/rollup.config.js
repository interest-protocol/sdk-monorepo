const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');

// Get workspace dependencies from dependencies
const workspaceDeps = Object.keys(pkg.dependencies || {}).filter((dep) =>
  pkg.dependencies[dep].startsWith('workspace:')
);

// Filter out published workspace dependencies
const publishedWorkspaceDeps = pkg.publishConfig?.dependencies
  ? Object.keys(pkg.publishConfig.dependencies)
  : [];

// Create a list of external dependencies
const external = [
  // Regular dependencies
  ...Object.keys(pkg.dependencies || {}).filter(
    (dep) => !workspaceDeps.includes(dep)
  ),
  // Published workspace dependencies
  ...publishedWorkspaceDeps,
];

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
  ],
  external,
  plugins: [
    resolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      preserveSymlinks: false,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
    }),
  ],
};
