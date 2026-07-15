import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Download, CheckCircle, XCircle, Clock, ShieldQuestion, Loader2, AlertTriangle, Undo2 } from "lucide-react";
import { useTallyPushLog, describeTallyPush, type TallyPushStatus } from "@/hooks/useTallyPushLog";
import { useCreateReversalPush } from "@/hooks/useTallyPushActions";

const STATUS_META: Record<TallyPushStatus, { label: string; badge: string; icon: ReactNode }> = {
  AWAITING_APPROVAL: {
    label: "Awaiting Approval",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <ShieldQuestion className="h-3.5 w-3.5 text-amber-500" />,
  },
  PENDING: {
    label: "Pending",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Clock className="h-3.5 w-3.5 text-blue-500" />,
  },
  SUCCESS: {
    label: "Success",
    badge: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="h-3.5 w-3.5 text-green-600" />,
  },
  FAILED: {
    label: "Failed",
    badge: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  },
};

function toCsv(rows: ReturnType<typeof describeTallyPush> extends never ? never : any[]): string {
  const header = ["Created", "Entry Type", "Party", "Detail", "Amount", "Voucher Type", "Status", "Tally Response"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [header.map(escape).join(",")];
  for (const { row, d } of rows) {
    lines.push(
      [
        new Date(row.created_at).toISOString(),
        d.label,
        d.party ?? "",
        d.detail,
        d.amount != null ? String(d.amount) : d.quantity ? `${d.quantity.value} ${d.quantity.unit}` : "",
        row.tally_voucher_type,
        row.push_status,
        row.tally_response ?? "",
      ]
        .map((v) => escape(String(v)))
        .join(","),
    );
  }
  return lines.join("\n");
}

export default function TallySyncLogs() {
  const { data: rows, isLoading, isError, error } = useTallyPushLog();
  const [statusFilter, setStatusFilter] = useState<"ALL" | TallyPushStatus>("ALL");
  const [reverseTarget, setReverseTarget] = useState<number | null>(null);
  const [reverseReason, setReverseReason] = useState("");
  const reversalMutation = useCreateReversalPush();

  const list = rows ?? [];
  const filtered = useMemo(
    () => (statusFilter === "ALL" ? list : list.filter((r) => r.push_status === statusFilter)),
    [list, statusFilter],
  );
  const decorated = useMemo(() => filtered.map((row) => ({ row, d: describeTallyPush(row) })), [filtered]);

  const handleExport = () => {
    const csv = toCsv(decorated);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tally-sync-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openReverse = (pushLogId: number) => {
    setReverseTarget(pushLogId);
    setReverseReason("");
  };

  const confirmReverse = () => {
    if (reverseTarget == null || !reverseReason.trim()) return;
    reversalMutation.mutate(
      { originalPushId: reverseTarget, reason: reverseReason.trim() },
      { onSuccess: () => setReverseTarget(null) },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sync Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Complete history of Tally push entries.</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "ALL" | TallyPushStatus)}>
            <SelectTrigger className="w-44" data-testid="filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {(Object.keys(STATUS_META) as TallyPushStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={decorated.length === 0} data-testid="btn-export">
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading sync logs…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load sync logs</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Entry Type</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tally Response</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decorated.map(({ row, d }) => (
                  <TableRow key={row.push_log_id} className={row.push_status === "FAILED" ? "bg-red-50/30" : ""}>
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
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {STATUS_META[row.push_status].icon}
                        <Badge className={STATUS_META[row.push_status].badge}>{STATUS_META[row.push_status].label}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate" title={row.tally_response ?? ""}>
                      {row.tally_response ?? "—"}
                    </TableCell>
                    <TableCell>
                      {row.push_status === "SUCCESS" && row.voucher_mode !== "REVERSAL" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => openReverse(row.push_log_id)}
                          data-testid={`reverse-${row.push_log_id}`}
                        >
                          <Undo2 className="h-3 w-3" />Reverse
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {decorated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No entries match this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={reverseTarget != null} onOpenChange={(open) => !open && setReverseTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Reversal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <p className="text-muted-foreground text-xs">
              This creates a new reversal entry (awaiting approval) linked back to push #{reverseTarget}. It does not
              modify the original entry.
            </p>
            <div>
              <Label>Reason</Label>
              <Input
                className="mt-1"
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                placeholder="Why is this being reversed?"
                data-testid="input-reverse-reason"
              />
            </div>
            {reversalMutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-red-50 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{(reversalMutation.error as Error)?.message}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReverseTarget(null)}>Cancel</Button>
            <Button
              disabled={!reverseReason.trim() || reversalMutation.isPending}
              onClick={confirmReverse}
              data-testid="btn-confirm-reverse"
            >
              {reversalMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Reversal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
