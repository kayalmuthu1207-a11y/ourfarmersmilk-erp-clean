import { type ReactNode } from "react";
import { Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [location] = useLocation();

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Checking session…</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    const redirectParam = encodeURIComponent(location);
    return <Redirect to={`/login?redirect=${redirectParam}`} />;
  }

  return <>{children}</>;
}
