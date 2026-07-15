import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function appsScriptBridge(appsScriptUrl: string): Plugin {
  async function handleRequest(req: any, res: any) {
    try {
      const method = String(req.method || 'GET').toUpperCase();

      const rawUrl = String(
        req.originalUrl || req.url || '',
      );

      const queryIndex = rawUrl.indexOf('?');
      const query =
        queryIndex >= 0 ? rawUrl.slice(queryIndex) : '';

      const upstreamUrl = `${appsScriptUrl}${query}`;

      let requestBody = '';

      if (method !== 'GET' && method !== 'HEAD') {
        for await (const chunk of req) {
          requestBody += chunk.toString();
        }
      }

      const upstreamResponse = await fetch(upstreamUrl, {
        method,

        headers: {
          'Content-Type': String(
            req.headers['content-type'] ||
              'text/plain;charset=utf-8',
          ),
          Accept: 'application/json,text/plain,*/*',
        },

        body:
          method === 'GET' || method === 'HEAD'
            ? undefined
            : requestBody,

        redirect: 'follow',
      });

      const responseText =
        await upstreamResponse.text();

      res.statusCode = upstreamResponse.status;

      res.setHeader(
        'Content-Type',
        upstreamResponse.headers.get('content-type') ||
          'application/json;charset=utf-8',
      );

      res.setHeader('Cache-Control', 'no-store');
      res.end(responseText);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Proxy Apps Script gagal.';

      res.statusCode = 502;
      res.setHeader(
        'Content-Type',
        'application/json;charset=utf-8',
      );

      res.end(
        JSON.stringify({
          success: false,
          code: 'PROXY_ERROR',
          message,
        }),
      );
    }
  }

  return {
    name: 'nafi-apps-script-bridge',

    configureServer(server) {
      server.middlewares.use(
        '/api/apps-script',
        (req, res) => {
          void handleRequest(req, res);
        },
      );
    },

    configurePreviewServer(server) {
      server.middlewares.use(
        '/api/apps-script',
        (req, res) => {
          void handleRequest(req, res);
        },
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const appsScriptUrl = String(
    env.VITE_APPS_SCRIPT_URL || '',
  ).trim();

  if (!appsScriptUrl) {
    throw new Error(
      'VITE_APPS_SCRIPT_URL belum dikonfigurasi.',
    );
  }

  return {
    plugins: [
      react(),
      appsScriptBridge(appsScriptUrl),
    ],

    base: '/',

    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
    },

    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
  };
});