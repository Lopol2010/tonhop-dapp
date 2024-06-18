import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
// import inject from '@rollup/plugin-inject'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills({
    include: ["buffer"],
    globals: {
      Buffer: true,
      global: false,
      process: false
    }
  })],
  build: {
    // rollupOptions: {
      // plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
    // },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      // define: {
      //   global: 'globalThis'
      // },
      // Enable esbuild polyfill plugins
      plugins: [
        // NodeGlobalsPolyfillPlugin({
        //   buffer: true
        // })
      ]
    }
  }

})
