import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';
import storage from '../utils/storage';
import { isSupabaseConfigured, supabase, supabaseConfigHint } from '../utils/supabase';

type AuthUser = {
  uid: string;
  email: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
};

type AuthProviderProps = { children: ReactNode };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined); // undefined = loading, null = logged out

  useEffect(() => {
    if (!isSupabaseConfigured) {
      storage.configureBackend(null);
      setUser(null);
      return;
    }
    let isMounted = true;

    const syncUser = async (nextUser: { id: string; email?: string | null } | null) => {
      if (!isMounted) {
        return;
      }

      setUser(nextUser ? { uid: nextUser.id, email: nextUser.email ?? null } : null);
      storage.configureBackend(nextUser?.id ?? null);

      if (nextUser) {
        try {
          await storage.migrateLocalToBackend(nextUser.id);
        } catch (e) {
          console.warn('migration failed', e);
        }
      }
    };

    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (error) {
          console.warn('getSession error', error);
          await syncUser(null);
          return;
        }

        await syncUser(data.session?.user ?? null);
      })
      .catch(async (error) => {
        console.warn('getSession error', error);
        await syncUser(null);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (!isSupabaseConfigured) {
        Alert.alert('Login error', supabaseConfigHint);
        return false;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert('Login error', error.message);
        return false;
      }
      return true;
    } catch (e: unknown) {
      Alert.alert('Login error', getErrorMessage(e));
      return false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      if (!isSupabaseConfigured) {
        Alert.alert('Register error', supabaseConfigHint);
        return false;
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('Register error', error.message);
        return false;
      }
      if (!data.session) {
        const signInResult = await supabase.auth.signInWithPassword({ email, password });
        if (signInResult.error) {
          Alert.alert('Akun dibuat', 'Akun berhasil dibuat. Silakan login dengan email dan password Anda.');
          return false;
        }
      }
      return true;
    } catch (e: unknown) {
      Alert.alert('Register error', getErrorMessage(e));
      return false;
    }
  };

  const signOut = async () => {
    try {
      if (!isSupabaseConfigured) {
        return false;
      }
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('signOut error', error);
        return false;
      }
      return true;
    } catch (e: unknown) {
      console.warn('signOut error', e);
      return false;
    }
  };

  const loading = user === undefined;

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
