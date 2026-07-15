import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Info, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerPrices } from "@/hooks/useCustomerPrices";
import { useCustomerProductMappings } from "@/hooks/useCustomerProductMappings";

const emptyForm = { customerId: 0, mappingId: 0, price: 0, effectiveFrom: new Date().toISOString().split("T")[0] };

export default function CustomersPricing() {
  const { data: customers } = useCustomers();
  const { data: prices, isLoading, isError, error } = useCustomerPrices();
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: dialogMappings } = useCustomerProductMappings(form.customerId || undefined);

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const { error } = await supabase.rpc("set_customer_price", {
        p_mapping_id: values.mappingId,
        p_price: values.price,
        p_effective_from: values.effectiveFrom,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-prices"] });
      setDialogOpen(false);
      setForm(emptyForm);
    },
  });

  const customerList = customers ?? [];
  const list = prices ?? [];

  const filtered = selectedCustomer === "all"
    ? list
    : list.filter((p) => String(p.customer_product_mapping?.customer_id) === selectedCustomer);

  const openAdd = () => {
    setForm({ ...emptyForm, customerId: selectedCustomer === "all" ? 0 : Number(selectedCustomer) });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.mappingId || form.price <= 0) return;
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Pricing</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set the price each customer pays for a specific product assignment.
          </p>
        </div>
        <Button onClick={openAdd} data-testid="btn-add-pricing">
          <Plus className="h-4 w-4 mr-2" />Set Price
        </Button>
      </div>

      <div className="rounded-lg border bg-blue-50/50 border-blue-200 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Assignment-Based Pricing: </span>
          Every price is set independently per customer-product assignment — there is no shared base
          price. The same product assigned to a customer under two different labels can carry two
          different prices.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Active Prices</p>
            <p className="text-2xl font-bold mt-1">{list.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Customers with Prices Set</p>
            <p className="text-2xl font-bold mt-1">{new Set(list.map((p) => p.customer_product_mapping?.customer_id)).size}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Label className="shrink-0 text-sm">Filter by Customer:</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="w-64" data-testid="select-customer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customerList.map((c) => (
                  <SelectItem key={c.customer_id} value={String(c.customer_id)}>{c.customer_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading prices…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load prices</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Effective From</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No prices found
                    </TableCell>
                  </TableRow>
                ) : filtered.map((p) => {
                  const mapping = p.customer_product_mapping;
                  const cust = customerList.find((c) => c.customer_id === mapping?.customer_id);
                  const label = mapping?.display_name ?? mapping?.product_master?.product_name ?? "—";
                  return (
                    <TableRow key={p.price_id}>
                      <TableCell className="font-medium max-w-[160px] truncate">{cust?.customer_name ?? mapping?.customer_id}</TableCell>
                      <TableCell className="text-sm">{label} <span className="text-muted-foreground">({mapping?.uom_master?.uom_name ?? "—"})</span></TableCell>
                      <TableCell className="text-right font-bold text-primary">₹{p.price}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.effective_from}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Customer Price</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <Select
                value={form.customerId ? String(form.customerId) : ""}
                onValueChange={(v) => setForm((f) => ({ ...f, customerId: Number(v), mappingId: 0 }))}
              >
                <SelectTrigger data-testid="select-pricing-customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customerList.map((c) => <SelectItem key={c.customer_id} value={String(c.customer_id)}>{c.customer_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assignment</Label>
              <Select
                value={form.mappingId ? String(form.mappingId) : ""}
                onValueChange={(v) => setForm((f) => ({ ...f, mappingId: Number(v) }))}
                disabled={!form.customerId}
              >
                <SelectTrigger data-testid="select-pricing-assignment"><SelectValue placeholder="Select assignment" /></SelectTrigger>
                <SelectContent>
                  {(dialogMappings ?? []).map((m) => {
                    const label = m.display_name ?? m.product_master?.product_name ?? "—";
                    return (
                      <SelectItem key={m.mapping_id} value={String(m.mapping_id)}>
                        {label} ({m.uom_master?.uom_name ?? "—"})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                  data-testid="input-price"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Effective From</Label>
                <Input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
                  data-testid="input-effective-from"
                />
              </div>
            </div>

            {saveMutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-red-50 px-3 py-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{(saveMutation.error as Error)?.message}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="btn-save-pricing">
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
