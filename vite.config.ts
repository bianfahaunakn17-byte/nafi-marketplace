import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const appsScriptUrl = String(
    env.VITE_APPS_SCRIPT_URL || '',
  ).trim();

  const appsScript = appsScriptUrl
    ? new URL(appsScriptUrl)
    : null;

  const proxy = appsScript
    ? {
        '/api/apps-script': {
          target: `${appsScript.protocol}//${appsScript.host}`,
          changeOrigin: true,
          secure: true,
          followRedirects: true,

          rewrite: (path: string) =>
            path.replace(
              /^\/api\/apps-script/,
              appsScript.pathname,
            ),

          timeout: 60000,
          proxyTimeout: 60000,
        },
      }
    : undefined;

  return {
    plugins: [react()],
    base: '/',

    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy,
    },

    preview: {
      host: '0.0.0.0',
      port: 4173,
      proxy,
    },
  };
});