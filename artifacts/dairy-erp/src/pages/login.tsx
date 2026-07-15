import { useState, useEffect, type FormEvent } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Milk, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/AuthContext";

export default function Login() {
  const { login, status } = useAuth();
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect on mount/status-change only — calling navigate() directly in the
  // render body (as this used to) fires on every re-render and can produce a
  // login <-> destination bounce loop instead of a clean one-time redirect.
  useEffect(() => {
    if (status === "authenticated") {
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect, { replace: true });
    }
  }, [status]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Milk className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">Sign in to DairyERP</CardTitle>
          <CardDescription>Staff access only</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@dairyerp.test"
                required
                data-testid="input-login-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                data-testid="input-login-password"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-red-50 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting} data-testid="btn-login-submit">
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Sign in
            </Button>
          </form>

          {/* TODO: this is a temporary mock auth service — replace with real
              Supabase Auth once public.users/roles schema is verified. */}
          <div className="mt-5 rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Demo credentials (mock auth)
            </p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>owner@dairyerp.test / password</li>
              <li>manager@dairyerp.test / password</li>
              <li>accountant@dairyerp.test / password</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
