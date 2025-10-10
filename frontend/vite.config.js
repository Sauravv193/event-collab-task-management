import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const plugins = [
    react({
      // Enable React refresh
      fastRefresh: true,
      // Include .jsx files
      include: '**/*.{jsx,js}',
    })
  ];

  // Conditionally add visualizer plugin only when ANALYZE is set
  if (process.env.ANALYZE) {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }));
  }

  return {
  plugins,
  
  // Define global variables
  define: {
    global: 'globalThis',
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
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
    hmr: {
      overlay: true,
    },
  },
  
  // Build optimizations
  build: {
    // Target modern browsers
    target: 'esnext',
    
    // Enable minification
    minify: 'terser',
    
    // Terser options for better compression
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
    
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'query': ['@tanstack/react-query'],
          'ui': ['framer-motion', 'lucide-react'],
          'utils': ['date-fns', 'axios'],
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            extType = 'images';
          } else if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name)) {
            extType = 'fonts';
          }
          
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
      
      // External dependencies (if using CDN)
      external: process.env.NODE_ENV === 'production' ? [] : [],
    },
    
    // Source maps
    sourcemap: process.env.NODE_ENV !== 'production',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Asset inlining threshold
    assetsInlineLimit: 4096,
  },
  
  // Preview server (for production builds)
  preview: {
    port: 4173,
    host: true,
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Add any CSS preprocessor options here
    },
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react',
      'date-fns',
      'axios',
    ],
    exclude: ['@tanstack/react-query-devtools'],
  },
  };
});
