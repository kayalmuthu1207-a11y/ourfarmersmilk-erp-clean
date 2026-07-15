import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useStockAdjustments } from "@/hooks/useStockAdjustments";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function StockAdjustments() {
  const { data: products } = useProducts();
  const { data: adjustments, isLoading } = useStockAdjustments();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [productId, setProductId] = useState("");
  const [adjQty, setAdjQty] = useState("");
  const [reason, setReason] = useState("");
  const [adjDate, setAdjDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || adjQty === "") return;
    setSaving(true);
    const { error } = await supabase.rpc("adjust_stock", {
      p_product_id: Number(productId),
      p_adjustment_qty: Number(adjQty),
      p_reason: reason || null,
      p_adjustment_date: adjDate,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Adjustment saved" });
    queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
    queryClient.invalidateQueries({ queryKey: ["inventory-balances"] });
    setProductId("");
    setAdjQty("");
    setReason("");
    setAdjDate(todayStr());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Adjustments</h1>
        <p className="text-muted-foreground text-sm mt-1">Record manual stock corrections. Use negative quantities to reduce stock.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>New Adjustment</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product-select">Product</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger id="product-select" className="mt-1">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((p) => (
                      <SelectItem key={p.product_id} value={String(p.product_id)}>
                        {p.product_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="adj-qty">Adjustment Quantity</Label>
                <Input
                  id="adj-qty"
                  type="number"
                  step="any"
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value)}
                  placeholder="e.g. 10 or -5"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Positive = add stock, negative = remove stock</p>
              </div>

              <div>
                <Label htmlFor="adj-reason">Reason</Label>
                <Textarea
                  id="adj-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe reason for adjustment…"
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="adj-date">Date</Label>
                <Input
                  id="adj-date"
                  type="date"
                  value={adjDate}
                  onChange={(e) => setAdjDate(e.target.value)}
                  className="mt-1 w-44"
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving || !productId || adjQty === ""}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving…" : "Save Adjustment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Adjustments</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="text-sm text-muted-foreground p-6 text-center">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!adjustments || adjustments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        No adjustments recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    adjustments.map((a) => (
                      <TableRow key={a.adjustment_id}>
                        <TableCell className="text-xs tabular-nums">{a.adjustment_date}</TableCell>
                        <TableCell className="text-sm font-medium">
                          {a.product_master?.product_name ?? `Product #${a.product_id}`}
                        </TableCell>
                        <TableCell className={`text-right font-bold tabular-nums text-sm ${a.adjustment_qty >= 0 ? "text-green-600" : "text-destructive"}`}>
                          {a.adjustment_qty > 0 ? "+" : ""}{a.adjustment_qty.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {a.reason ? (
                            <Badge variant="outline" className="text-xs max-w-[120px] truncate">
                              {a.reason}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
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
    </div>
  );
}
