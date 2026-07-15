import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "./index";
import type { AuthSession, AuthUser } from "./types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let mounted = true;

    authService.getSession().then((s) => {
      if (!mounted) return;
      setSession(s);
      setStatus(s ? "authenticated" : "unauthenticated");
    });

    const unsubscribe = authService.onAuthStateChange((s) => {
      if (!mounted) return;
      setSession(s);
      setStatus(s ? "authenticated" : "unauthenticated");
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const logout = async () => {
    await authService.signOut();
  };

  return (
    <AuthContext.Provider value={{ status, user: session?.user ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
