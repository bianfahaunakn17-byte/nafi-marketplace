const API_URL = String(
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycby_Ml2EnguTo-dChfmoxH_sM5r2bZVzUGxV8X_-iCqyNOmvesuXUqT4avJYMna_ut6zOA/exec'
).trim();
export const SESSION_KEY = 'nafi_session_token';

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

function validateUrl(): string {
  if (!API_URL) throw new ApiError('CONFIG_ERROR', 'Website belum terhubung ke API.');
  if (!API_URL.startsWith('https://')) throw new ApiError('CONFIG_ERROR', 'URL API harus menggunakan HTTPS.');
  if (!API_URL.endsWith('/exec')) throw new ApiError('CONFIG_ERROR', 'URL API harus berakhiran /exec.');
  return API_URL;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) throw new ApiError('INVALID_RESPONSE', 'Server memberikan respons kosong.');
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new ApiError('INVALID_RESPONSE', 'Respons server bukan JSON yang valid.'); }
  if (Array.isArray(parsed)) return parsed as T;
  const envelope = parsed as { success?: boolean; data?: T; code?: string; message?: string };
  if (envelope.success === false) throw new ApiError(envelope.code || 'SERVER_ERROR', envelope.message || 'Permintaan gagal.');
  if (envelope.success === true) return envelope.data as T;
  return parsed as T;
}

function controllerWithTimeout() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 20000);
  return { controller, timeoutId };
}

export async function apiGet<T>(action: string, params: Record<string, string | number | boolean | undefined | null> = {}): Promise<T> {
  const url = new URL(validateUrl());
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') url.searchParams.set(key, String(value));
  });
  const { controller, timeoutId } = controllerWithTimeout();
  try {
    const response = await fetch(url.toString(), { method: 'GET', redirect: 'follow', signal: controller.signal });
    return await parseResponse<T>(response);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new ApiError('TIMEOUT', 'Koneksi ke server terlalu lama.');
    if (error instanceof ApiError) throw error;
    throw new ApiError('NETWORK_ERROR', 'Tidak dapat terhubung ke server.');
  } finally { window.clearTimeout(timeoutId); }
}

export async function apiPost<T>(action: string, payload: Record<string, unknown> = {}, requireAuth = true): Promise<T> {
  const { controller, timeoutId } = controllerWithTimeout();
  try {
    const sessionToken = requireAuth ? localStorage.getItem(SESSION_KEY) || '' : '';
    const response = await fetch(validateUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload, sessionToken }),
      redirect: 'follow',
      signal: controller.signal,
    });
    return await parseResponse<T>(response);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new ApiError('TIMEOUT', 'Koneksi ke server terlalu lama.');
    if (error instanceof ApiError) throw error;
    throw new ApiError('NETWORK_ERROR', 'Tidak dapat terhubung ke server.');
  } finally { window.clearTimeout(timeoutId); }
}

export function errorMessage(error: unknown): string {
  const code = error instanceof ApiError ? error.code : '';
  const map: Record<string, string> = {
    CONFIG_ERROR: 'Website belum terhubung ke API.',
    VALIDATION: error instanceof Error ? error.message : 'Periksa kembali data yang Anda masukkan.',
    INVALID_CREDENTIALS: 'Email atau password yang Anda masukkan salah.',
    EMAIL_EXISTS: 'Email tersebut sudah terdaftar. Silakan login.',
    UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
    FORBIDDEN: 'Anda tidak memiliki izin membuka halaman ini.',
    ACCOUNT_DISABLED: 'Akun Anda sedang dinonaktifkan.',
    ACCOUNT_LOCKED: 'Akun terkunci sementara.',
    NOT_FOUND: 'Data yang Anda cari tidak ditemukan.',
    TIMEOUT: 'Koneksi ke server terlalu lama.',
    NETWORK_ERROR: 'Tidak dapat terhubung ke server.',
    INVALID_RESPONSE: 'Respons server tidak valid.',
    SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba kembali.',
  };
  return map[code] || (error instanceof Error ? error.message : 'Terjadi kesalahan.');
}
