import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {randomFillSync} from 'node:crypto';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// Vite expects Web Crypto getRandomValues to exist in the running Node environment.
if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.getRandomValues !== 'function') {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: (arr: Uint8Array) => randomFillSync(arr),
    },
    configurable: true,
  });
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/SleepSyncAlarm/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify-file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
