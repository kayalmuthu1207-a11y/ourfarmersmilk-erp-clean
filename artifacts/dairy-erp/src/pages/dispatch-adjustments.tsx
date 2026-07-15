import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRecentDispatchLinesForAdjustment } from "@/hooks/useRecentDispatchLinesForAdjustment";
import { useDeliveryAdjustments } from "@/hooks/useDeliveryAdjustments";

const ADJUSTMENT_TYPES = ["SHORTAGE", "DAMAGE", "RETURN", "EXCESS", "OTHER"];

const approvalBadgeClass = (status: string): string => {
  const s = status.toUpperCase();
  if (["APPROVED", "CONFIRMED", "ACCEPTED"].includes(s)) return "bg-green-50 text-green-700 border-green-200";
  if (["REJECTED", "DECLINED"].includes(s)) return "bg-red-50 text-red-700 border-red-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

const emptyForm = {
  dispatchLineId: "",
  adjustmentType: "",
  deliveredQty: "",
  remarks: "",
};

export default function DispatchAdjustments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: dispatchLines, isLoading: linesLoading } = useRecentDispatchLinesForAdjustment();
  const { data: adjustments, isLoading: adjLoading, isError: adjError, error: adjErr } = useDeliveryAdjustments();

  const [form, setForm] = useState(emptyForm);

  const logMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("log_delivery_adjustment", {
        p_dispatch_line_id: Number(form.dispatchLineId),
        p_adjustment_type: form.adjustmentType,
        p_delivered_qty: Number(form.deliveredQty),
        p_remarks: form.remarks.trim() || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-adjustments"] });
      toast({ title: "Adjustment logged", description: "The delivery adjustment has been recorded." });
      setForm(emptyForm);
    },
    onError: (err: Error) => {
      toast({ title: "Could not log adjustment", description: err.message, variant: "destructive" });
    },
  });

  const selectedLine = dispatchLines?.find((l) => String(l.dispatch_line_id) === form.dispatchLineId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dispatch Adjustments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Log delivery shortages, damages, or returns against a dispatch line.
        </p>
      </div>

      {/* Section 1 — Log New Adjustment */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">Log New Adjustment</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Dispatch Line <span className="text-destructive">*</span></Label>
            <Select
              value={form.dispatchLineId}
              onValueChange={(v) => setForm((f) => ({ ...f, dispatchLineId: v }))}
            >
              <SelectTrigger data-testid="select-dispatch-line">
                <SelectValue placeholder={linesLoading ? "Loading…" : "Select a dispatch line"} />
              </SelectTrigger>
              <SelectContent>
                {(dispatchLines ?? []).map((l) => {
                  const customer = l.dispatch_record?.customer_order?.customer_master?.customer_name ?? "Unknown";
                  const product = l.product_master?.product_name ?? `Product #${l.product_id}`;
                  const date = l.dispatch_record?.dispatch_date ?? "";
                  return (
                    <SelectItem key={l.dispatch_line_id} value={String(l.dispatch_line_id)}>
                      {date} · {customer} · {product} (Line #{l.dispatch_line_id})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedLine && (
              <p className="text-xs text-muted-foreground">
                Ordered: {selectedLine.ordered_base_qty} · Dispatched: {selectedLine.dispatched_base_qty}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Adjustment Type <span className="text-destructive">*</span></Label>
              <Select
                value={form.adjustmentType}
                onValueChange={(v) => setForm((f) => ({ ...f, adjustmentType: v }))}
              >
                <SelectTrigger data-testid="select-adjustment-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ADJUSTMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Actual Delivered Qty <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                min={0}
                value={form.deliveredQty}
                onChange={(e) => setForm((f) => ({ ...f, deliveredQty: e.target.value }))}
                placeholder="0"
                data-testid="input-delivered-qty"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Remarks</Label>
            <Textarea
              value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              placeholder="Optional notes about this adjustment…"
              rows={2}
              data-testid="textarea-remarks"
            />
          </div>

          <div className="flex justify-end">
            <Button
              disabled={
                !form.dispatchLineId ||
                !form.adjustmentType ||
                !form.deliveredQty ||
                logMutation.isPending
              }
              onClick={() => logMutation.mutate()}
              data-testid="btn-log-adjustment"
            >
              {logMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Log Adjustment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Recent Adjustments (read-only) */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">Recent Adjustments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {adjLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading adjustments…</span>
            </div>
          ) : adjError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load adjustments</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(adjErr as Error)?.message}</p>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {(adjustments ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                      No adjustments yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (adjustments ?? []).map((a) => (
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
                        <Badge variant="outline" className={`text-xs ${approvalBadgeClass(a.approval_status)}`}>
                          {a.approval_status}
                        </Badge>
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
