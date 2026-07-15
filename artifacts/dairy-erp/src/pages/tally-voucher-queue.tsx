import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertTriangle, Clock, Check } from "lucide-react";
import { useTallyPushLog, describeTallyPush } from "@/hooks/useTallyPushLog";
import { useApproveTallyPush } from "@/hooks/useTallyPushActions";

export default function TallyVoucherQueue() {
  const { data: rows, isLoading, isError, error } = useTallyPushLog(["AWAITING_APPROVAL"]);
  const approveMutation = useApproveTallyPush();

  const list = rows ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Voucher Queue</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Entries awaiting approval before they're queued for Tally.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <p className="text-2xl font-bold">{list.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading voucher queue…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load voucher queue</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Entry Type</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Voucher Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((row) => {
                  const d = describeTallyPush(row);
                  const isApproving = approveMutation.isPending && approveMutation.variables === row.push_log_id;
                  return (
                    <TableRow key={row.push_log_id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{d.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{d.party ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.detail}</TableCell>
                      <TableCell className="text-right font-medium">
                        {d.amount != null
                          ? `₹${d.amount.toLocaleString()}`
                          : d.quantity
                          ? `${d.quantity.value.toLocaleString()} ${d.quantity.unit}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.tally_voucher_type}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1"
                          disabled={isApproving}
                          onClick={() => approveMutation.mutate(row.push_log_id)}
                          data-testid={`approve-${row.push_log_id}`}
                        >
                          {isApproving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Nothing awaiting approval.
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
