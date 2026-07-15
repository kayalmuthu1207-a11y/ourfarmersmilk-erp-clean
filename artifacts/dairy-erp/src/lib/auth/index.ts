import { mockAuthService } from "./mockAuthService";
import type { AuthService } from "./types";

// Single swap point: once Supabase Auth is verified and ready, replace this
// export with a `supabaseAuthService` (implementing the same `AuthService`
// interface from ./types) and nothing else in the app needs to change.
export const authService: AuthService = mockAuthService;

export * from "./types";
