/**
 * staffServiceSession.ts
 *
 * Signs the Supabase client into a dedicated staff service account at app
 * boot so that every query runs under the `authenticated` role and RLS
 * policies work as designed — without opening any anon grants.
 *
 * Credentials are stored as Replit Secrets (VITE_STAFF_SERVICE_EMAIL /
 * VITE_STAFF_SERVICE_PASSWORD) and are only ever sent to your own Supabase
 * project over HTTPS.
 *
 * Call `initStaffSession()` once in main.tsx before rendering the app.
 */

import { supabase } from "@/lib/supabase";

const STAFF_EMAIL = import.meta.env.VITE_STAFF_SERVICE_EMAIL as string | undefined;
const STAFF_PASSWORD = import.meta.env.VITE_STAFF_SERVICE_PASSWORD as string | undefined;

export async function initStaffSession(): Promise<void> {
  if (!STAFF_EMAIL || !STAFF_PASSWORD) {
    console.warn(
      "[staffServiceSession] VITE_STAFF_SERVICE_EMAIL / VITE_STAFF_SERVICE_PASSWORD are not set. " +
        "Supabase queries will run as anon and RLS-protected tables will return empty results.",
    );
    return;
  }

  // Reuse an existing valid session (e.g. after a hot-reload).
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    console.info("[staffServiceSession] Existing session found — skipping sign-in.");
    const { data: { user } } = await supabase.auth.getUser();
    console.log("[staffServiceSession] Actual authenticated user ID:", user?.id);
    const { data, error } = await supabase.rpc("is_staff");
    console.log("[staffServiceSession] Live is_staff() result:", data, "error:", error);
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: STAFF_EMAIL,
    password: STAFF_PASSWORD,
  });

  if (error) {
    console.error(
      "[staffServiceSession] Failed to sign in as staff service account:",
      error.message,
    );
  } else {
    console.info("[staffServiceSession] Staff service session established.");
  }
}
