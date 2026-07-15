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
import { useLocalPurchases } from "@/hooks/useLocalPurchases";

// NOTE: No vendor_master table was found in the schema. Vendor reference is
// stored as a plain numeric vendor_id in local_purchase_entry. Until a vendor
// management table exists, vendor is entered as a free-text field and passed
// as a placeholder ID. This should be updated once vendor management is built.

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function LocalPurchase() {
  const { data: products } = useProducts();
  const { data: purchases, isLoading } = useLocalPurchases();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [vendorRef, setVendorRef] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !quantity || !amount) return;
    setSaving(true);
    // vendor_id: since there's no vendor table yet, pass 0 as a placeholder.
    // The RPC signature requires p_vendor_id; update this once vendor management is added.
    const { error } = await supabase.rpc("record_local_purchase", {
      p_vendor_id: 0,
      p_product_id: Number(productId),
      p_quantity: Number(quantity),
      p_purchase_amount: Number(amount),
      p_purchase_date: purchaseDate,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Purchase recorded" });
    queryClient.invalidateQueries({ queryKey: ["local-purchases"] });
    queryClient.invalidateQueries({ queryKey: ["inventory-balances"] });
    setVendorRef("");
    setProductId("");
    setQuantity("");
    setAmount("");
    setPurchaseDate(todayStr());
  }

  const totalAmount = purchases?.reduce((s, p) => s + Number(p.purchase_amount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Local Purchase</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Record external product purchases to supplement production.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Purchases</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{purchases?.length ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Amount</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">₹{totalAmount.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>New Purchase</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="vendor-ref">Vendor Name / Reference</Label>
                <Input
                  id="vendor-ref"
                  value={vendorRef}
                  onChange={(e) => setVendorRef(e.target.value)}
                  placeholder="e.g. Salem Paneer Suppliers"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  No vendor master table exists yet — entering as free text for reference.
                </p>
              </div>

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
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Purchase Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="purchase-date">Date</Label>
                <Input
                  id="purchase-date"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="mt-1 w-44"
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving || !productId || !quantity || !amount}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving…" : "Record Purchase"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Purchases</CardTitle></CardHeader>
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
                    <TableHead className="text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!purchases || purchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        No purchases recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchases.map((p) => (
                      <TableRow key={p.purchase_id}>
                        <TableCell className="text-xs tabular-nums">{p.purchase_date}</TableCell>
                        <TableCell className="text-sm font-medium">
                          {p.product_master?.product_name ?? `Product #${p.product_id}`}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{Number(p.quantity).toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-medium">
                          ₹{Number(p.purchase_amount).toLocaleString()}
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
