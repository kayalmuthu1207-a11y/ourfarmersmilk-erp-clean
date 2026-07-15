import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { useTallyPushLog, describeTallyPush } from "@/hooks/useTallyPushLog";
import { useRetryFailedPush } from "@/hooks/useTallyPushActions";

export default function TallyFailed() {
  const { data: rows, isLoading, isError, error } = useTallyPushLog(["FAILED"]);
  const retryMutation = useRetryFailedPush();

  const list = rows ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Failed Pushes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Entries Tally rejected, with the response returned. For bulk retries, use the Resync page.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Currently Failed</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{list.length}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading failed pushes…</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Failed to load failed pushes</p>
          <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
        </div>
      ) : list.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            No failed pushes right now.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((row) => {
            const d = describeTallyPush(row);
            const isRetrying = retryMutation.isPending && retryMutation.variables === row.push_log_id;
            return (
              <Card key={row.push_log_id} className="border-red-200">
                <CardContent className="p-4 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{d.label}</Badge>
                      <span className="text-sm font-medium">{d.party ?? d.detail}</span>
                      <span className="text-xs text-muted-foreground">
                        {d.amount != null
                          ? `₹${d.amount.toLocaleString()}`
                          : d.quantity
                          ? `${d.quantity.value.toLocaleString()} ${d.quantity.unit}`
                          : ""}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="rounded-md bg-red-50 border border-red-100 px-3 py-2">
                    <p className="text-xs text-destructive whitespace-pre-wrap">
                      {row.tally_response ?? "No response recorded for this failure."}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      disabled={isRetrying}
                      onClick={() => retryMutation.mutate(row.push_log_id)}
                      data-testid={`retry-${row.push_log_id}`}
                    >
                      {isRetrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
