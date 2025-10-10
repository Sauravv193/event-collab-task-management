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
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@context': resolve(__dirname, 'src/context'),
    },
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: true,
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
