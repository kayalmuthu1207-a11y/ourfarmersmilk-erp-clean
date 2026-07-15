import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useDeliveryAdjustments } from "@/hooks/useDeliveryAdjustments";

// No approve/reject RPC found in pg_proc for delivery_adjustment or shortage.
// Using direct supabase.from("delivery_adjustment").update(...) for approve/reject.

const APPROVED_STATUSES = new Set(["APPROVED", "CONFIRMED", "ACCEPTED"]);
const REJECTED_STATUSES = new Set(["REJECTED", "DECLINED"]);

function isPending(status: string): boolean {
  const s = status.toUpperCase();
  return !APPROVED_STATUSES.has(s) && !REJECTED_STATUSES.has(s);
}

const approvalBadge = (status: string): string => {
  const s = status.toUpperCase();
  if (APPROVED_STATUSES.has(s)) return "bg-green-50 text-green-700 border-green-200";
  if (REJECTED_STATUSES.has(s)) return "bg-red-50 text-red-700 border-red-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

export default function BillingShortageAdjustments() {
  const { data: adjustments, isLoading, isError, error } = useDeliveryAdjustments();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      newStatus,
    }: {
      id: number;
      newStatus: string;
    }) => {
      const { error } = await supabase
        .from("delivery_adjustment")
        .update({ approval_status: newStatus })
        .eq("delivery_adjustment_id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-adjustments"] });
      toast({
        title: newStatus === "APPROVED" ? "Adjustment approved" : "Adjustment rejected",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
    },
  });

  const list = adjustments ?? [];
  const pending = list.filter((a) => isPending(a.approval_status)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Shortage Adjustments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Delivery adjustments where the delivered quantity differed from the ordered quantity.
          Approve/reject uses a direct table update — no RPC was found in the schema.
        </p>
      </div>

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold mt-1">{list.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className={`text-2xl font-bold mt-1 ${pending > 0 ? "text-amber-600" : ""}`}>{pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {list.filter((a) => APPROVED_STATUSES.has(a.approval_status.toUpperCase())).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total Amount Impact</p>
              <p className="text-2xl font-bold mt-1">
                ₹{list.reduce((s, a) => s + a.amount_impact, 0).toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">Delivery Adjustments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading adjustments…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load adjustments</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispatch Line</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Delivered</TableHead>
                  <TableHead className="text-right">Adj Qty</TableHead>
                  <TableHead className="text-right">Amount Impact</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                      No delivery adjustments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((a) => (
                    <TableRow key={a.delivery_adjustment_id}>
                      <TableCell className="text-sm font-medium">#{a.dispatch_line_id}</TableCell>
                      <TableCell className="text-sm">{a.adjustment_type}</TableCell>
                      <TableCell className="text-right text-sm">{a.ordered_qty}</TableCell>
                      <TableCell className="text-right text-sm">{a.delivered_qty}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-destructive">
                        {a.adjustment_qty}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        ₹{a.amount_impact.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                        {a.remarks ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${approvalBadge(a.approval_status)}`}>
                          {a.approval_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isPending(a.approval_status) && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-700 border-green-300 hover:bg-green-50"
                              disabled={updateMutation.isPending}
                              onClick={() =>
                                updateMutation.mutate({
                                  id: a.delivery_adjustment_id,
                                  newStatus: "APPROVED",
                                })
                              }
                              data-testid={`btn-approve-adj-${a.delivery_adjustment_id}`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              disabled={updateMutation.isPending}
                              onClick={() =>
                                updateMutation.mutate({
                                  id: a.delivery_adjustment_id,
                                  newStatus: "REJECTED",
                                })
                              }
                              data-testid={`btn-reject-adj-${a.delivery_adjustment_id}`}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
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
