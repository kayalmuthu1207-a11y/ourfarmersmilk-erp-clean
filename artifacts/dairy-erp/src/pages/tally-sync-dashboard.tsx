import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertTriangle, CheckCircle, XCircle, Clock, ShieldQuestion, Info } from "lucide-react";
import { useTallyPushLog, describeTallyPush, type TallyPushStatus } from "@/hooks/useTallyPushLog";

const STATUS_META: Record<TallyPushStatus, { label: string; badge: string; icon: ReactNode }> = {
  AWAITING_APPROVAL: {
    label: "Awaiting Approval",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <ShieldQuestion className="h-4 w-4 text-amber-500" />,
  },
  PENDING: {
    label: "Pending Push",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Clock className="h-4 w-4 text-blue-500" />,
  },
  SUCCESS: {
    label: "Synced",
    badge: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
  },
  FAILED: {
    label: "Failed",
    badge: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="h-4 w-4 text-destructive" />,
  },
};

export default function TallySyncDashboard() {
  const { data: rows, isLoading, isError, error } = useTallyPushLog();
  const list = rows ?? [];

  const counts: Record<TallyPushStatus, number> = {
    AWAITING_APPROVAL: 0,
    PENDING: 0,
    SUCCESS: 0,
    FAILED: 0,
  };
  for (const row of list) counts[row.push_status] += 1;

  const recent = list.slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tally Sync Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of the Tally push queue.</p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-900">
          No sync bridge is connected yet. Entries move through <span className="font-medium">Awaiting Approval</span> and{" "}
          <span className="font-medium">Pending Push</span> here, but nothing pushes to Tally itself until that bridge
          is built. Synced/Failed counts will stay at zero until then.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading dashboard…</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Failed to load dashboard</p>
          <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(Object.keys(STATUS_META) as TallyPushStatus[]).map((status) => (
              <Card key={status}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{STATUS_META[status].label}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  {STATUS_META[status].icon}
                  <p className="text-2xl font-bold">{counts[status]}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Entry Type</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((row) => {
                    const d = describeTallyPush(row);
                    return (
                      <TableRow key={row.push_log_id}>
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
                          <Badge className={STATUS_META[row.push_status].badge}>
                            {STATUS_META[row.push_status].label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {recent.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No Tally push activity yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
