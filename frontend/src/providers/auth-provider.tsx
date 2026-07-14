'use client';

import type { UserResponse, LoginInput, RegisterInput, AuthResponse } from '@aisoftco/shared';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

import { apiClient, setTokens, clearTokens, getAccessToken, getRefreshToken } from '@/lib/api-client';

interface AuthContextValue {
  user: UserResponse | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await apiClient.get<UserResponse>('/users/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await apiClient.post<AuthResponse>('/auth/login', input, { skipAuth: true });
      setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      router.push('/dashboard');
    },
    [router]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await apiClient.post<AuthResponse>('/auth/register', input, { skipAuth: true });
      setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      router.push('/dashboard');
    },
    [router]
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    clearTokens();
    setUser(null);
    if (refreshToken) {
      apiClient.post('/auth/logout', { refreshToken }, { skipAuth: true }).catch(() => {});
    }
    router.push('/login');
  }, [router]);

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
