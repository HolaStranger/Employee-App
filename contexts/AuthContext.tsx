import type { User } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const AUTH_STORAGE_KEY = '@technova_auth_user';
const API_BASE_URL = 'http://172.20.10.3:4000'; // Change if your backend URL changes

type LoginPayload = {
  email: string;
  password: string;
  role: string;
};

type SignupPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
};

async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message ? data.message : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {
        console.log('[Auth] Failed to load stored user', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistUser = useCallback(async (u: User | null) => {
    try {
      if (!u) await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      else await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    } catch (e) {
      console.log('[Auth] Persist user error', e);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedInUser = await apiPost<User>('/login', payload);
    setUser(loggedInUser);
    await persistUser(loggedInUser);
    return loggedInUser;
  }, [persistUser]);

  const signup = useCallback(async (payload: SignupPayload) => {
    const createdUser = await apiPost<User>('/signup', payload);
    setUser(createdUser);
    await persistUser(createdUser);
    return createdUser;
  }, [persistUser]);

  const logout = useCallback(async () => {
    setUser(null);
    await persistUser(null);
  }, [persistUser]);

  const isManager = user?.role === 'manager';

  return { user, isManager, isLoading, login, signup, logout };
});