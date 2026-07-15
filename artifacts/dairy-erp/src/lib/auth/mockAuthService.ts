import type { AuthService, AuthSession, AuthUser } from "./types";

// TEMPORARY mock auth service.
//
// Not backed by Supabase Auth yet — see replit.md / prior agent conversation
// for why (schema for public.users/roles and their link to auth.users has not
// been verified). This exists purely so the frontend has a real, working auth
// framework (context, guards, login UI, logout) that can be exercised end to
// end today. When Supabase Auth is wired in, replace this file's export with
// a `supabaseAuthService` implementing the same `AuthService` interface —
// nothing else in the app should need to change.

const STORAGE_KEY = "dairy_erp_mock_session";
const MOCK_LOGIN_DELAY_MS = 500;

// TODO: replace with real Supabase Auth users once public.users/roles schema
// and its link to auth.users has been verified (see login flow investigation).
const MOCK_USERS: Array<{ email: string; password: string; user: AuthUser }> = [
  {
    email: "owner@dairyerp.test",
    password: "password",
    user: { id: "mock-1", email: "owner@dairyerp.test", name: "Ops Manager", role: "Owner" },
  },
  {
    email: "manager@dairyerp.test",
    password: "password",
    user: { id: "mock-2", email: "manager@dairyerp.test", name: "Ravi Kumar", role: "Manager" },
  },
  {
    email: "accountant@dairyerp.test",
    password: "password",
    user: { id: "mock-3", email: "accountant@dairyerp.test", name: "Priya S", role: "Accountant" },
  },
];

type Listener = (session: AuthSession | null) => void;

function readStoredSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function writeStoredSession(session: AuthSession | null) {
  if (session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class MockAuthService implements AuthService {
  private listeners = new Set<Listener>();

  async getSession(): Promise<AuthSession | null> {
    return readStoredSession();
  }

  onAuthStateChange(callback: Listener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    await delay(MOCK_LOGIN_DELAY_MS);

    const match = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );
    if (!match) {
      throw new Error("Invalid email or password.");
    }

    const session: AuthSession = { user: match.user };
    writeStoredSession(session);
    this.notify(session);
    return session;
  }

  async signOut(): Promise<void> {
    await delay(150);
    writeStoredSession(null);
    this.notify(null);
  }

  private notify(session: AuthSession | null) {
    for (const listener of this.listeners) listener(session);
  }
}

export const mockAuthService: AuthService = new MockAuthService();
