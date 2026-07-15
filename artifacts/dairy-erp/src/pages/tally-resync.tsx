import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { useTallyPushLog, describeTallyPush } from "@/hooks/useTallyPushLog";
import { useRetryFailedPush } from "@/hooks/useTallyPushActions";

export default function TallyResync() {
  const { data: rows, isLoading, isError, error } = useTallyPushLog(["FAILED"]);
  const retryMutation = useRetryFailedPush();
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkRunning, setBulkRunning] = useState(false);

  const list = rows ?? [];
  const decorated = useMemo(() => list.map((row) => ({ row, d: describeTallyPush(row) })), [list]);

  const toggleSelect = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleSelectAll = () =>
    setSelected((prev) => (prev.length === list.length ? [] : list.map((r) => r.push_log_id)));

  const retryMany = async (ids: number[]) => {
    setBulkRunning(true);
    try {
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        await retryMutation.mutateAsync(id);
      }
      setSelected([]);
    } finally {
      setBulkRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resync</h1>
        <p className="text-muted-foreground text-sm mt-1">Retry entries that failed to push to Tally.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Failed Entries ({list.length})</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={selected.length === 0 || bulkRunning}
                onClick={() => retryMany(selected)}
                data-testid="btn-retry-selected"
              >
                {bulkRunning && selected.length > 0 ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry Selected ({selected.length})
              </Button>
              <Button
                size="sm"
                disabled={list.length === 0 || bulkRunning}
                onClick={() => retryMany(list.map((r) => r.push_log_id))}
                data-testid="btn-retry-all"
              >
                {bulkRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Retry All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading failed entries…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load failed entries</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={list.length > 0 && selected.length === list.length}
                      onCheckedChange={toggleSelectAll}
                      data-testid="select-all"
                    />
                  </TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Entry Type</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Last Response</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decorated.map(({ row, d }) => {
                  const isRetrying =
                    (retryMutation.isPending && retryMutation.variables === row.push_log_id) ||
                    (bulkRunning && selected.includes(row.push_log_id));
                  return (
                    <TableRow key={row.push_log_id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(row.push_log_id)}
                          onCheckedChange={() => toggleSelect(row.push_log_id)}
                          data-testid={`select-${row.push_log_id}`}
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{d.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{d.party ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {d.amount != null
                          ? `₹${d.amount.toLocaleString()}`
                          : d.quantity
                          ? `${d.quantity.value.toLocaleString()} ${d.quantity.unit}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-destructive max-w-[220px] truncate" title={row.tally_response ?? ""}>
                        {row.tally_response ?? "—"}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  );
                })}
                {decorated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No failed entries. Nothing to resync.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
