import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Force Rollup to use WASM in CI environments
if (process.env.CI) {
  process.env.ROLLUP_USE_WASM = '1';
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  
  // Define global variables
  define: {
    global: 'globalThis',
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend/src'),
      '@components': resolve(__dirname, 'frontend/src/components'),
      '@pages': resolve(__dirname, 'frontend/src/pages'),
      '@services': resolve(__dirname, 'frontend/src/services'),
      '@utils': resolve(__dirname, 'frontend/src/utils'),
      '@context': resolve(__dirname, 'frontend/src/context'),
    },
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8080',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  
  // Build optimizations
  build: {
    // Target es2015 for better compatibility
    target: 'es2015',
    
    // Use esbuild for minification (faster and more compatible than terser)
    minify: 'esbuild',
    
    // Simplified rollup options
    rollupOptions: {
      output: {
        // Simple manual chunks
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
      // Prevent external dependencies from causing issues
      external: [],
    },
    
    // Force CommonJS for better compatibility
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1600,
  },
  
  // Preview server (for production builds)
  preview: {
    port: 4173,
    host: true,
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
  },
});
