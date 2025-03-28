import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  external: ['container'],
  output: [
    {
      file: 'dist/engine-server.js',
      format: 'es',
      globals: {
        container: 'container'
      }
    },
    {
      file: 'dist/engine-server.min.js',
      format: 'es',
      globals: {
        container: 'container'
      },
      plugins: [
        terser({
          mangle: true,
          compress: true
        })
      ]
    }
  ]
};
