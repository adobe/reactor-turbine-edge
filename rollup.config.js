import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  external: ['container'],
  output: {
    file: 'dist/engine-server.js',
    exports: 'named',
    format: 'cjs',
    globals: {
      container: 'container'
    }
  },
  plugins: [
    resolve({
      preferBuiltins: false
    }),
    commonjs()
  ]
};
