import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  browserSupabaseConfig,
  getSupabaseBrowserClient,
} from "@/lib/supabase/client";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** False when Supabase env is absent — app runs on local seed data. */
  configured: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  configured: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useMemo(
    () => getSupabaseBrowserClient(browserSupabaseConfig()),
    [],
  );
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    client.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    const { data: listener } = client.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      },
    );
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [client]);

  const signOut = useCallback(async () => {
    if (client) await client.auth.signOut();
    setUser(null);
    setSession(null);
  }, [client]);

  const value = useMemo<AuthState>(
    () => ({ user, session, loading, configured: client !== null, signOut }),
    [user, session, loading, client, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
