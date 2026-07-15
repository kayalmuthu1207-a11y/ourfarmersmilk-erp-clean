import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useRecentProductionEntries } from "@/hooks/useRecentProductionEntries";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function ProductionEntry() {
  const { data: products } = useProducts();
  const { data: recentEntries, isLoading } = useRecentProductionEntries();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [productId, setProductId] = useState("");
  const [producedQty, setProducedQty] = useState("");
  const [spoilageQty, setSpoilageQty] = useState("0");
  const [productionDate, setProductionDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !producedQty) return;
    setSaving(true);
    // Note: the enter_production RPC manages batch creation/lookup internally —
    // no batch_id parameter is needed on the form.
    const { error } = await supabase.rpc("enter_production", {
      p_product_id: Number(productId),
      p_produced_qty: Number(producedQty),
      p_spoilage_qty: Number(spoilageQty) || 0,
      p_production_date: productionDate,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Production entry saved" });
    queryClient.invalidateQueries({ queryKey: ["recent-production-entries"] });
    queryClient.invalidateQueries({ queryKey: ["production-history"] });
    queryClient.invalidateQueries({ queryKey: ["inventory-balances"] });
    setProductId("");
    setProducedQty("");
    setSpoilageQty("0");
    setProductionDate(todayStr());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Production Entry</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Record actual production output. Batch creation is handled automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>New Entry</CardTitle></CardHeader>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="produced-qty">Produced Quantity</Label>
                  <Input
                    id="produced-qty"
                    type="number"
                    min="0"
                    step="any"
                    value={producedQty}
                    onChange={(e) => setProducedQty(e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="spoilage-qty">Spoilage Quantity</Label>
                  <Input
                    id="spoilage-qty"
                    type="number"
                    min="0"
                    step="any"
                    value={spoilageQty}
                    onChange={(e) => setSpoilageQty(e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="prod-date">Production Date</Label>
                <Input
                  id="prod-date"
                  type="date"
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  className="mt-1 w-44"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={saving || !productId || !producedQty}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving…" : "Save Entry"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Last 50 Entries</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="text-sm text-muted-foreground p-6 text-center">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Produced</TableHead>
                    <TableHead className="text-right">Spoilage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!recentEntries || recentEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        No entries recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentEntries.map((entry) => (
                      <TableRow key={entry.batch_line_id}>
                        <TableCell className="text-xs tabular-nums">
                          {entry.production_batch?.production_date ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {entry.product_master?.product_name ?? `Product #${entry.product_id}`}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-bold text-green-600">
                          {Number(entry.produced_qty).toLocaleString()}
                        </TableCell>
                        <TableCell className={`text-right tabular-nums text-sm ${Number(entry.spoilage_qty) > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                          {Number(entry.spoilage_qty).toLocaleString()}
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
