import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Package, Link as LinkIcon, Info, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { useUomMaster } from "@/hooks/useUomMaster";
import { useCustomerProductMappings } from "@/hooks/useCustomerProductMappings";

const typeBadge: Record<string, string> = {
  Apartment: "bg-blue-50 text-blue-700 border-blue-200",
  Hotel: "bg-purple-50 text-purple-700 border-purple-200",
  Factory: "bg-slate-50 text-slate-700 border-slate-200",
  Office: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Retail: "bg-green-50 text-green-700 border-green-200",
  Commercial: "bg-orange-50 text-orange-700 border-orange-200",
};

const emptyForm = { customerId: 0, productId: 0, uomId: 0, displayName: "" };

export default function CustomersProductMapping() {
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  const { data: uoms } = useUomMaster();
  const { data: mappings, isLoading, isError, error } = useCustomerProductMappings();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const assignMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const { error } = await supabase.rpc("assign_product_to_customer", {
        p_customer_id: values.customerId,
        p_product_id: values.productId,
        p_uom_id: values.uomId,
        p_display_name: values.displayName || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-product-mappings"] });
      setOpen(false);
      setForm(emptyForm);
    },
  });

  const customerList = customers ?? [];
  const list = mappings ?? [];

  const filtered = list.filter((m) => {
    const label = m.display_name ?? m.product_master?.product_name ?? "";
    const matchSearch = label.toLowerCase().includes(search.toLowerCase());
    const matchCustomer = selectedCustomer === "all" || String(m.customer_id) === selectedCustomer;
    return matchSearch && matchCustomer;
  });

  const handleAdd = () => {
    if (!form.customerId || !form.productId || !form.uomId) return;
    assignMutation.mutate(form);
  };

  const assignedCountByCustomer = customerList.map((c) => ({
    ...c,
    productCount: list.filter((m) => m.customer_id === c.customer_id && m.is_active).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Assignment</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Assign which products each customer can order. A product must be assigned before a price can be set.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="btn-assign-product">
          <Plus className="h-4 w-4 mr-2" />Assign Product
        </Button>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Product assignment precedes pricing</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Products shown in the portal Place Order page are filtered to only those assigned here. 
            Go to Customer Pricing to set per-customer prices for already-assigned products.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {assignedCountByCustomer.filter((c) => c.productCount > 0).map((c) => (
          <div key={c.customer_id} className="border rounded-lg px-4 py-3 bg-card flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{c.customer_name}</p>
              {c.category && <Badge variant="outline" className={`mt-1 text-xs ${typeBadge[c.category] ?? ""}`}>{c.category}</Badge>}
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0">
              <Package className="h-3 w-3 mr-1" />{c.productCount} products
            </Badge>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search product name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="w-56"><SelectValue placeholder="All Customers" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customerList.filter((c) => c.status === "ACTIVE").map((c) => (
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
              <span className="text-sm">Loading assignments…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load product assignments</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => {
                  const cust = customerList.find((c) => c.customer_id === m.customer_id);
                  const label = m.display_name ?? m.product_master?.product_name ?? "—";
                  return (
                    <TableRow key={m.mapping_id}>
                      <TableCell>
                        <div className="font-medium text-sm">{cust?.customer_name ?? m.customer_id}</div>
                        {cust?.category && <Badge variant="outline" className={`mt-0.5 text-xs ${typeBadge[cust.category] ?? ""}`}>{cust.category}</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.uom_master?.uom_name ?? "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={m.is_active ? "bg-green-100 text-green-800 border-green-200 text-xs" : "bg-gray-100 text-gray-700 text-xs"}>
                          {m.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No product assignments found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {/* TODO: there's no RPC yet to deactivate/remove a customer-product mapping,
              so a "Remove" action is intentionally omitted here. */}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assign Product to Customer</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <Select value={form.customerId ? String(form.customerId) : ""} onValueChange={(v) => setForm((f) => ({ ...f, customerId: Number(v) }))}>
                <SelectTrigger data-testid="select-customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customerList.filter((c) => c.status === "ACTIVE").map((c) => (
                    <SelectItem key={c.customer_id} value={String(c.customer_id)}>{c.customer_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* TODO: no way yet to browse only this customer's *unassigned* products —
                this picker shows all products regardless of existing assignments. */}
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Select value={form.productId ? String(form.productId) : ""} onValueChange={(v) => setForm((f) => ({ ...f, productId: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {(products ?? []).map((p) => (
                    <SelectItem key={p.product_id} value={String(p.product_id)}>{p.product_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select value={form.uomId ? String(form.uomId) : ""} onValueChange={(v) => setForm((f) => ({ ...f, uomId: Number(v) }))}>
                <SelectTrigger data-testid="select-uom"><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {(uoms ?? []).map((u) => (
                    <SelectItem key={u.uom_id} value={String(u.uom_id)}>{u.uom_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Display Label (optional)</Label>
              <Input
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder={'Leave blank to use the product\'s own name — only set this if this customer should see a different label, e.g. "Village Cow\'s Milk"'}
                data-testid="input-display-name"
              />
            </div>

            {assignMutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-red-50 px-3 py-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{(assignMutation.error as Error)?.message}</p>
              </div>
            )}

            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex items-start gap-2">
              <LinkIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              After assignment, go to Customer Pricing to set the price for this product.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={assignMutation.isPending} data-testid="btn-save-assignment">
              {assignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
