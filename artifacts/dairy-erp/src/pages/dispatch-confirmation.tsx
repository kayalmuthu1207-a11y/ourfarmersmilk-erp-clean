import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRecentDispatchLines, type DispatchLineForAdjustment } from "@/hooks/useRecentDispatchLines";

const REASON_CODES = ["Shortage", "Damage", "Return", "Manual Adjustment"] as const;

export default function DeliveryConfirmation() {
  const { data: lines, isLoading, isError, error } = useRecentDispatchLines();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [reporting, setReporting] = useState<DispatchLineForAdjustment | null>(null);
  const [deliveredQty, setDeliveredQty] = useState(0);
  const [reasonType, setReasonType] = useState<(typeof REASON_CODES)[number] | "">("");
  const [remarks, setRemarks] = useState("");

  const adjustmentMutation = useMutation({
    mutationFn: async () => {
      if (!reporting || !reasonType) return;
      const { error } = await supabase.rpc("log_delivery_adjustment", {
        p_dispatch_line_id: reporting.dispatch_line_id,
        p_adjustment_type: reasonType.toUpperCase().replace(" ", "_"),
        p_delivered_qty: deliveredQty,
        p_remarks: remarks || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-dispatch-lines"] });
      toast({ title: "Issue reported", description: "The delivery adjustment has been logged." });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to log adjustment", description: err.message, variant: "destructive" });
    },
  });

  const openReport = (line: DispatchLineForAdjustment) => {
    setReporting(line);
    setDeliveredQty(line.dispatched_base_qty);
    setReasonType("");
    setRemarks("");
  };

  const closeDialog = () => {
    setReporting(null);
    setReasonType("");
    setRemarks("");
  };

  const handleSubmit = () => {
    if (!reporting) return;
    if (deliveredQty === reporting.dispatched_base_qty) {
      closeDialog();
      return;
    }
    if (!reasonType) return;
    adjustmentMutation.mutate();
  };

  const list = lines ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Delivery Confirmation</h1>
          <p className="text-muted-foreground text-sm mt-1">Report post-delivery issues per dispatched product</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <span className="font-medium">Post-delivery issues only.</span>{" "}
        <span className="text-muted-foreground">
          This screen handles damage, shortage, and returns discovered during or after delivery.
          Dispatch-time stock shortages (before loading) are handled in Dispatch Planning.
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading recent dispatch lines…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load dispatch lines</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Dispatch Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Dispatched Qty</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((line) => (
                  <TableRow key={line.dispatch_line_id}>
                    <TableCell className="font-medium">
                      {line.dispatch_record?.customer_order?.customer_master?.customer_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {line.dispatch_record?.dispatch_date ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{line.product_master?.product_name ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono">{line.dispatched_base_qty}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openReport(line)} data-testid={`btn-report-${line.dispatch_line_id}`}>
                        Report Issue
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No dispatch lines found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!reporting} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Report Issue — {reporting?.dispatch_record?.customer_order?.customer_master?.customer_name ?? ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="bg-muted rounded p-3">
              <p className="text-muted-foreground">Product</p>
              <p className="font-medium mt-1">{reporting?.product_master?.product_name}</p>
              <p className="text-muted-foreground mt-2">Dispatched Qty</p>
              <p className="font-medium mt-1">{reporting?.dispatched_base_qty}</p>
            </div>
            <div>
              <Label>Delivered Quantity</Label>
              <Input
                type="number"
                value={deliveredQty}
                onChange={(e) => setDeliveredQty(parseFloat(e.target.value) || 0)}
                className="mt-1"
                data-testid="input-delivered-qty"
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Select value={reasonType} onValueChange={(v) => setReasonType(v as (typeof REASON_CODES)[number])}>
                <SelectTrigger className="mt-1" data-testid="select-issue-type">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_CODES.map((code) => (
                    <SelectItem key={code} value={code}>{code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Remarks</Label>
              <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} className="mt-1" data-testid="input-remarks" />
            </div>

            {adjustmentMutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-red-50 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{(adjustmentMutation.error as Error)?.message}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={adjustmentMutation.isPending || (deliveredQty !== reporting?.dispatched_base_qty && !reasonType)}
              data-testid="btn-save-confirmation"
            >
              {adjustmentMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
