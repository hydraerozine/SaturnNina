import { fileURLToPath, URL } from 'url';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['ethers', 'three', '@solana/web3.js'],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    sveltekit(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    environment(["VITE_SOLANA_RPC_ENDPOINT"]),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
    ],
  },
  define: {
    'process.env': process.env,
    'import.meta.env.VITE_SOLANA_RPC_ENDPOINT': JSON.stringify(process.env.VITE_SOLANA_RPC_ENDPOINT),
    'import.meta.env.CANISTER_ID_NINA_BACKEND': JSON.stringify(process.env.CANISTER_ID_NINA_BACKEND),
    'import.meta.env.CANISTER_ID_NINA_FRONTEND': JSON.stringify(process.env.CANISTER_ID_NINA_FRONTEND),
  },
});