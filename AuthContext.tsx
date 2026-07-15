import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SESSION_KEY, errorMessage } from '../api';
import { marketplaceService } from '../service';
import type { AuthResponse, User, UserRole } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(raw: Record<string, unknown>): User {
  const roleRaw = String(raw.role || 'customer');
  const role: UserRole = roleRaw === 'admin' || roleRaw === 'staff' ? roleRaw : 'customer';
  return {
    id: String(raw.user_id ?? raw.id ?? ''),
    name: String(raw.full_name ?? raw.name ?? ''),
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    avatarUrl: String(raw.avatar_url ?? raw.avatarUrl ?? ''),
    role,
    status: String(raw.status ?? 'active'),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) { setUser(null); setIsLoading(false); return; }
    setIsLoading(true);
    try { setUser(normalizeUser(await marketplaceService.getMe())); setError(''); }
    catch (e) { localStorage.removeItem(SESSION_KEY); setUser(null); setError(errorMessage(e)); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void refreshUser(); }, [refreshUser]);

  const applyAuth = (result: AuthResponse) => {
    if (!result?.sessionToken || !result?.user) throw new Error('Respons autentikasi tidak lengkap.');
    localStorage.setItem(SESSION_KEY, result.sessionToken);
    const normalized = normalizeUser(result.user);
    setUser(normalized);
    setError('');
    return normalized;
  };

  const login = async (email: string, password: string) => {
    try { return applyAuth(await marketplaceService.login({ email, password })); }
    catch (e) { setError(errorMessage(e)); throw e; }
  };
  const register = async (name: string, email: string, password: string, phone = '') => {
    try { return applyAuth(await marketplaceService.register({ name, email, password, phone })); }
    catch (e) { setError(errorMessage(e)); throw e; }
  };
  const logout = async () => {
    try { await marketplaceService.logout(); } catch { /* tetap bersihkan lokal */ }
    finally { localStorage.removeItem(SESSION_KEY); setUser(null); }
  };

  const value = useMemo(() => ({ user, isLoading, isAuthenticated: Boolean(user), error, login, register, logout, refreshUser, clearError: () => setError('') }), [user, isLoading, error, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return ctx;
}
