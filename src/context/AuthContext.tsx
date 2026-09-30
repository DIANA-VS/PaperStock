import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { auth } from '../constants/firebaseConfig';
import { UserProfile } from '../types';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function translateError(code?: string) {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/invalid-email':
      return 'El correo no es válido.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/email-already-in-use':
      return 'Ese correo ya está registrado con otra contraseña.';
    case 'auth/network-request-failed':
      return 'No hay conexión a internet. Revisa tu WiFi/datos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera un momento e intenta de nuevo.';
    default:
      return 'No se pudo iniciar sesión. Intenta de nuevo.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario',
          email: fbUser.email || '',
          role: 'Administrador',
        });
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { ok: false, error: 'Ingresa tu correo y contraseña.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    try {
      // Primero intenta iniciar sesión con una cuenta existente
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { ok: true };
    } catch (err: any) {
      // Si la cuenta no existe todavía, la creamos automáticamente
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          await firebaseUpdateProfile(credential.user, {
            displayName: email.split('@')[0],
          });
          return { ok: true };
        } catch (createErr: any) {
          return { ok: false, error: translateError(createErr.code) };
        }
      }
      return { ok: false, error: translateError(err.code) };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (name: string, email: string) => {
    if (!auth.currentUser) return;
    await firebaseUpdateProfile(auth.currentUser, { displayName: name });
    setUser((prev) => (prev ? { ...prev, name, email } : prev));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
