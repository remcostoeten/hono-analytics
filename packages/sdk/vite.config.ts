import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        react: resolve(__dirname, 'src/react.ts')
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'js' : 'cjs'
        return `${entryName}.${ext}`
      }
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom',
        /^next\//  // Externalize all next/* imports
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    minify: false,
    sourcemap: true
  }
})
