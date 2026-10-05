import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../constants/supabaseConfig';
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

function translateError(message?: string) {
  if (!message) return 'No se pudo iniciar sesión. Intenta de nuevo.';
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (message.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (message.includes('User already registered')) return 'Ese correo ya está registrado con otra contraseña.';
  if (message.includes('Unable to validate email')) return 'El correo no es válido.';
  if (message.includes('Network')) return 'No hay conexión a internet.';
  return 'No se pudo iniciar sesión. Intenta de nuevo.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await applySession(session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const applySession = async (session: any) => {
    if (session?.user) {
      const metaName = session.user.user_metadata?.name as string | undefined;

      // Consulta el rol real del usuario en la tabla profiles (empleado por defecto)
      let role = 'Empleado';
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (profile?.role === 'administrador') role = 'Administrador';
      else if (profile?.role === 'empleado') role = 'Empleado';

      setUser({
        name: metaName || session.user.email?.split('@')[0] || 'Usuario',
        email: session.user.email || '',
        role,
      });
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { ok: false, error: 'Ingresa tu correo y contraseña.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!signInError) return { ok: true };

    // Si no existe la cuenta, la creamos automáticamente (igual que antes)
    if (signInError.message.includes('Invalid login credentials')) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: email.split('@')[0] } },
      });
      if (signUpError) return { ok: false, error: translateError(signUpError.message) };
      return { ok: true };
    }

    return { ok: false, error: translateError(signInError.message) };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (name: string, email: string) => {
    const { error } = await supabase.auth.updateUser({ data: { name } });
    if (!error) {
      setUser((prev) => (prev ? { ...prev, name, email } : prev));
    }
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
