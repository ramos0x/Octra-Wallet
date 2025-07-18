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
    proxy: {
      '/api': {
        target: 'https://octra.network',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
        configure: (proxy, options) => {
          // Handle dynamic target based on localStorage
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Get RPC URL from request headers for dynamic routing
            const rpcUrl = req.headers['x-rpc-url'];
            if (rpcUrl && typeof rpcUrl === 'string') {
              try {
                const url = new URL(rpcUrl);
                
                // Update the proxy target dynamically
                const target = `${url.protocol}//${url.host}`;
                
                // Set the new target host
                proxyReq.setHeader('host', url.host);
                
                // Log the dynamic routing
                console.log(`Proxying request to: ${target}${req.url}`);
              } catch (error) {
                console.warn('Invalid RPC URL in header:', rpcUrl);
              }
            }
          });
          
          // Handle dynamic target change
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const rpcUrl = req.headers['x-rpc-url'];
            if (rpcUrl && typeof rpcUrl === 'string') {
              try {
                const url = new URL(rpcUrl);
                // Change the target for this specific request
                proxy.changeOrigin = true;
                proxy.target = `${url.protocol}//${url.host}`;
              } catch (error) {
                console.warn('Failed to change proxy target:', error);
              }
            }
          });
        }
      },
    },
  },
  preview: {
    port: 3000,
    host: true
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