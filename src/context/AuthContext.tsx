import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@paperstock_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setIsLoggedIn(true);
          setUser(saved);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { ok: false, error: 'Ingresa tu correo y contraseña.' };
    }
    if (password.length < 4) {
      return { ok: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
    }
    const profile: UserProfile = {
      name: email.split('@')[0] || 'Usuario',
      email,
      role: 'Administrador',
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
    setIsLoggedIn(true);
    return { ok: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
