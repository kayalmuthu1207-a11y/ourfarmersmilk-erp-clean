import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import { useRolePermissions } from "@/hooks/useRolePermissions";

export default function RolePermissions() {
  const { data: roles, isLoading, isError, error } = useRolePermissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roles &amp; Permissions</h1>
        <p className="text-muted-foreground text-sm mt-1">Permissions granted to each role</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading roles…</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Failed to load roles</p>
          <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(roles ?? []).map((r) => (
            <Card key={r.role_id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {r.role_code === "OWNER" && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                  <CardTitle className="text-base">{r.role_name}</CardTitle>
                  <Badge variant="outline" className="text-xs">{r.role_code}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {r.permissions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No permissions granted</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {r.permissions.map((p) => (
                      <Badge key={p} variant="secondary" className="text-xs font-normal">{p}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
