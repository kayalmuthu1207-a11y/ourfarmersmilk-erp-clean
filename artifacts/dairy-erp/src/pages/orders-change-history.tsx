import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, Search, Clock } from "lucide-react";
import { useOrderChangeHistory } from "@/hooks/useOrderChangeHistory";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
}

export default function OrdersChangeHistory() {
  const { data: entries, isLoading, isError, error } = useOrderChangeHistory();
  const [search, setSearch] = useState("");

  const list = entries ?? [];

  const filtered = search.trim()
    ? list.filter((e) => {
        const term = search.toLowerCase();
        return (
          (e.customer_order?.customer_master?.customer_name ?? "").toLowerCase().includes(term) ||
          String(e.order_id).includes(term)
        );
      })
    : list;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Order Change History</h1>
        <p className="text-muted-foreground text-sm mt-1">Most recent 300 order change log entries, newest first.</p>
      </div>

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Change Log Entries</p>
              <p className="text-2xl font-bold mt-1">{list.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Distinct Orders Affected</p>
              <p className="text-2xl font-bold mt-1">{new Set(list.map((e) => e.order_id)).size}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="text-base">Change Log</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or order ID…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-change-history"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading change history…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load change history</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Changed At</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Change Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No change log entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((e) => (
                    <TableRow key={e.change_log_id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          {formatDate(e.changed_at)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-primary">#{e.order_id}</TableCell>
                      <TableCell className="text-sm">
                        {e.customer_order?.customer_master?.customer_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm max-w-sm">{e.change_description}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
