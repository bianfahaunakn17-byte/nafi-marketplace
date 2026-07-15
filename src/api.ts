const DIRECT_API_URL = String(
  import.meta.env.VITE_APPS_SCRIPT_URL || '',
).trim();

const DEV_GET_PROXY_URL = '/api/apps-script';

export const SESSION_KEY = 'nafi_session_token';

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  code?: string;
  message?: string;
};

function validateDirectUrl(): string {
  if (!DIRECT_API_URL) {
    throw new ApiError(
      'CONFIG_ERROR',
      'Website belum terhubung ke API.',
    );
  }

  if (!DIRECT_API_URL.startsWith('https://')) {
    throw new ApiError(
      'CONFIG_ERROR',
      'URL API harus menggunakan HTTPS.',
    );
  }

  if (!DIRECT_API_URL.endsWith('/exec')) {
    throw new ApiError(
      'CONFIG_ERROR',
      'URL API harus berakhiran /exec.',
    );
  }

  return DIRECT_API_URL;
}

/**
 * GET memakai proxy Vite ketika development karena proxy GET
 * sudah terbukti berhasil menampilkan produk.
 */
function getGetEndpoint(): string {
  validateDirectUrl();

  return import.meta.env.DEV
    ? DEV_GET_PROXY_URL
    : DIRECT_API_URL;
}

/**
 * POST selalu langsung menuju Apps Script.
 * Jangan melewati bridge WebContainer karena menghasilkan 502.
 */
function getPostEndpoint(): string {
  return validateDirectUrl();
}

function createGetUrl(): URL {
  return new URL(
    getGetEndpoint(),
    window.location.origin,
  );
}

function createTimeout(timeoutMs = 60000) {
  const controller = new AbortController();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return {
    controller,
    timeoutId,
  };
}

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  const responseText = await response.text();

  if (!responseText.trim()) {
    throw new ApiError(
      'INVALID_RESPONSE',
      'Server memberikan respons kosong.',
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(responseText.trim());
  } catch {
    if (import.meta.env.DEV) {
      console.error(
        '[NAFI API] Respons non-JSON:',
        responseText.slice(0, 300),
      );
    }

    throw new ApiError(
      'INVALID_RESPONSE',
      'Respons server tidak valid.',
    );
  }

  // Kompatibilitas endpoint lama yang mengembalikan array langsung.
  if (Array.isArray(parsed)) {
    return parsed as T;
  }

  const envelope = parsed as ApiEnvelope<T>;

  if (envelope.success === false) {
    throw new ApiError(
      envelope.code || 'SERVER_ERROR',
      envelope.message || 'Permintaan gagal.',
    );
  }

  if (envelope.success === true) {
    return envelope.data as T;
  }

  // Kompatibilitas jika backend mengembalikan object langsung.
  return parsed as T;
}

function convertNetworkError(error: unknown): never {
  if (
    error instanceof DOMException &&
    error.name === 'AbortError'
  ) {
    throw new ApiError(
      'TIMEOUT',
      'Koneksi ke server terlalu lama.',
    );
  }

  if (error instanceof ApiError) {
    throw error;
  }

  if (import.meta.env.DEV) {
    console.error('[NAFI API] Network error:', error);
  }

  throw new ApiError(
    'NETWORK_ERROR',
    'Tidak dapat terhubung ke server.',
  );
}

export async function apiGet<T>(
  action: string,
  params: Record<
    string,
    string | number | boolean | null | undefined
  > = {},
): Promise<T> {
  const url = createGetUrl();

  url.searchParams.set('action', action);

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {
      url.searchParams.set(key, String(value));
    }
  });

  const { controller, timeoutId } = createTimeout();

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal,
    });

    return await parseResponse<T>(response);
  } catch (error) {
    return convertNetworkError(error);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function apiPost<T>(
  action: string,
  payload: Record<string, unknown> = {},
  requireAuth = true,
): Promise<T> {
  const { controller, timeoutId } = createTimeout();

  try {
    const sessionToken = requireAuth
      ? localStorage.getItem(SESSION_KEY) || ''
      : '';

    const response = await fetch(getPostEndpoint(), {
      method: 'POST',

      headers: {
        'Content-Type':
          'text/plain;charset=utf-8',
        Accept: 'application/json,text/plain,*/*',
      },

      body: JSON.stringify({
        action,
        ...payload,
        sessionToken,
      }),

      redirect: 'follow',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
    });

    return await parseResponse<T>(response);
  } catch (error) {
    return convertNetworkError(error);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function errorMessage(
  error: unknown,
): string {
  const code =
    error instanceof ApiError ? error.code : '';

  const messages: Record<string, string> = {
    CONFIG_ERROR:
      'Website belum terhubung ke API.',

    VALIDATION:
      'Periksa kembali data yang Anda masukkan.',

    INVALID_CREDENTIALS:
      'Email atau password yang Anda masukkan salah.',

    EMAIL_EXISTS:
      'Email tersebut sudah terdaftar. Silakan login.',

    UNAUTHORIZED:
      'Sesi Anda telah berakhir. Silakan login kembali.',

    FORBIDDEN:
      'Anda tidak memiliki izin membuka halaman ini.',

    ACCOUNT_DISABLED:
      'Akun Anda sedang dinonaktifkan.',

    ACCOUNT_LOCKED:
      'Akun terkunci sementara.',

    NOT_FOUND:
      'Data yang Anda cari tidak ditemukan.',

    TIMEOUT:
      'Koneksi ke server terlalu lama.',

    NETWORK_ERROR:
      'Tidak dapat terhubung ke server.',

    INVALID_RESPONSE:
      'Respons server tidak valid.',

    SERVER_ERROR:
      'Terjadi kesalahan pada server. Silakan coba kembali.',
  };

  return (
    messages[code] ||
    (error instanceof Error
      ? error.message
      : 'Terjadi kesalahan.')
  );
}