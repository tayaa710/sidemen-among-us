import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Group React and related libraries into a single vendor chunk
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          
          // Group UI libraries
          if (id.includes('node_modules/primereact')) {
            return 'vendor-ui';
          }
          
          // Group analytics separately
          if (id.includes('node_modules/@vercel/analytics')) {
            return 'analytics';
          }
          
          // Group utility libraries (axios etc)
          if (id.includes('node_modules/axios') || 
             id.includes('node_modules/express-async-errors')) {
            return 'vendor-utils';
          }
          
          // Split our own code by major components
          if (id.includes('/Video/')) {
            return 'component-video';
          }
          
          if (id.includes('/HomeScreen/filterBar/')) {
            return 'component-filter';
          }
          
          if (id.includes('/HomeScreen/players/')) {
            return 'component-players';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
})
