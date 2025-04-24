import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.tsx'],
  format: ['esm'],
  clean: true,
  dts: true,
  sourcemap: true,
  target: 'node16',
  shims: true,
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
