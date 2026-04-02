import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Alert, AppState } from 'react-native';
import storage from '../utils/storage';
import { isSupabaseConfigured, supabase, supabaseConfigHint } from '../utils/supabase';

type UserRole = 'user' | 'admin';

type AuthUser = {
  uid: string;
  email: string | null;
  role: UserRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
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

async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();

    if (error) {
      console.warn('getUserRole error', error);
      return 'user';
    }

    return data?.role === 'admin' ? 'admin' : 'user';
  } catch (error) {
    console.warn('getUserRole error', error);
    return 'user';
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

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

      storage.configureBackend(nextUser?.id ?? null);

      if (!nextUser) {
        setUser(null);
        return;
      }

      const role = await getUserRole(nextUser.id);

      if (!isMounted) {
        return;
      }

      setUser({
        uid: nextUser.id,
        email: nextUser.email ?? null,
        role,
      });

      try {
        await storage.migrateLocalToBackend(nextUser.id);
      } catch (error) {
        console.warn('migration failed', error);
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

    const appStateSubscription = AppState.addEventListener('change', async (state) => {
      if (state !== 'active' || !isMounted) {
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('refreshSession error', error);
          return;
        }

        await syncUser(data.session?.user ?? null);
      } catch (error) {
        console.warn('refreshSession error', error);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      appStateSubscription.remove();
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
    } catch (error: unknown) {
      Alert.alert('Login error', getErrorMessage(error));
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
    } catch (error: unknown) {
      Alert.alert('Register error', getErrorMessage(error));
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
    } catch (error: unknown) {
      console.warn('signOut error', error);
      return false;
    }
  };

  const loading = user === undefined;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading, isAdmin, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
