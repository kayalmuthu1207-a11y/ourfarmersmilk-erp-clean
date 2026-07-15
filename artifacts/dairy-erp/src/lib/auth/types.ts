// Auth abstraction layer.
//
// This interface is intentionally shaped to match what Supabase Auth naturally
// provides (session + user + async signIn/signOut + change subscription), so
// that swapping `mockAuthService` for a real `supabaseAuthService` later is a
// drop-in replacement with no changes needed in AuthContext, ProtectedRoute,
// or the login page.

export type StaffRole =
  | "Owner"
  | "Administrator"
  | "Manager"
  | "Accountant"
  | "Delivery Manager"
  | "Collection Operator";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
}

export interface AuthSession {
  user: AuthUser;
}

export interface AuthService {
  /** Resolve the current session, if any (e.g. from persisted storage). */
  getSession(): Promise<AuthSession | null>;
  /** Subscribe to session changes. Returns an unsubscribe function. */
  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void;
  /** Sign in with email/password. Throws on failure. */
  signIn(email: string, password: string): Promise<AuthSession>;
  /** Sign out the current session. */
  signOut(): Promise<void>;
}
