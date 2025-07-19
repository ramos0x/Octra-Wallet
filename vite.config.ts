import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          crypto: ['tweetnacl', 'bip39'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ]
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
        configure: (proxy, options) => {
          // Handle dynamic target based on X-RPC-Target header
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Get RPC URL from X-RPC-Target header
            const rpcTarget = req.headers['x-rpc-target'];
            if (rpcTarget && typeof rpcTarget === 'string') {
              try {
                const url = new URL(rpcTarget);
                
                // Update proxy target dynamically
                proxy.options.target = `${url.protocol}//${url.host}`;
                proxyReq.setHeader('host', url.host);
                
                // Log the dynamic routing
                console.log(`Proxying request to: ${url.protocol}//${url.host}${req.url}`);
              } catch (error) {
                console.warn('Invalid RPC URL in header:', rpcTarget);
                // Fallback to default
                proxy.options.target = 'https://octra.network';
              }
            } else {
              // Default target if no header provided
              proxy.options.target = 'https://octra.network';
            }
          });
        }
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
    cors: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer/',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ],
    },
  },
});