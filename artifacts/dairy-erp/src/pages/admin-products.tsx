import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Package, Search, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useProductCategories } from "@/hooks/useProductCategories";
import { useUomMaster } from "@/hooks/useUomMaster";

const PRODUCT_TYPES = ["MILK", "VAP"] as const;

const typeBadge: Record<string, string> = {
  MILK: "bg-blue-50 text-blue-700 border-blue-200",
  VAP: "bg-purple-50 text-purple-700 border-purple-200",
};

const emptyForm = { name: "", categoryId: 0, productType: "MILK" as "MILK" | "VAP", baseUomId: 0 };

export default function AdminProducts() {
  const { data: products, isLoading, isError, error } = useProducts();
  const { data: categories } = useProductCategories();
  const { data: uoms } = useUomMaster();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      if (editId) {
        const { error } = await supabase
          .from("product_master")
          .update({
            product_name: values.name,
            category_id: values.categoryId,
            base_uom_id: values.baseUomId,
            product_type: values.productType,
          })
          .eq("product_id", editId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("product_master").insert({
          product_name: values.name,
          category_id: values.categoryId,
          base_uom_id: values.baseUomId,
          product_type: values.productType,
        });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ productId, newStatus }: { productId: number; newStatus: "ACTIVE" | "INACTIVE" }) => {
      const { error } = await supabase
        .from("product_master")
        .update({ active_status: newStatus })
        .eq("product_id", productId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const list = products ?? [];

  const filtered = list.filter((p) => {
    const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || p.product_type === filterType;
    const matchCat = filterCat === "all" || String(p.category_id) === filterCat;
    return matchSearch && matchType && matchCat;
  });

  const stats = {
    total: list.length,
    active: list.filter((p) => p.active_status === "ACTIVE").length,
    milk: list.filter((p) => p.product_type === "MILK").length,
    vap: list.filter((p) => p.product_type === "VAP").length,
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.product_id);
    setForm({ name: p.product_name, categoryId: p.category_id, productType: p.product_type, baseUomId: p.base_uom_id });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.categoryId || !form.baseUomId) return;
    saveMutation.mutate(form);
  };

  const toggleActive = (p: Product) => {
    toggleMutation.mutate({ productId: p.product_id, newStatus: p.active_status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Master</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all products — milk and VAP</p>
        </div>
        <Button onClick={openAdd} data-testid="btn-add-product">
          <Plus className="h-4 w-4 mr-2" />Add Product
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: stats.total, icon: Package },
          { label: "Active", value: stats.active, icon: Package },
          { label: "Milk Products", value: stats.milk, icon: Package },
          { label: "VAP Products", value: stats.vap, icon: Package },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40" data-testid="select-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-40" data-testid="select-cat-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categories ?? []).map((c) => (
                  <SelectItem key={c.category_id} value={String(c.category_id)}>{c.category_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading products…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load products</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Product Type</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No products found</TableCell>
                  </TableRow>
                ) : filtered.map((p) => (
                  <TableRow key={p.product_id} className={p.active_status !== "ACTIVE" ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{p.product_name}</TableCell>
                    <TableCell>{p.product_category?.category_name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${typeBadge[p.product_type] ?? ""}`}>{p.product_type}</Badge>
                    </TableCell>
                    <TableCell>{p.uom_master?.uom_name ?? "—"}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={p.active_status === "ACTIVE"}
                        onCheckedChange={() => toggleActive(p)}
                        disabled={toggleMutation.isPending && toggleMutation.variables?.productId === p.product_id}
                        data-testid={`toggle-active-${p.product_id}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(p)}
                        data-testid={`btn-edit-${p.product_id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Product Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Pasteurized Milk 500ml"
                data-testid="input-name"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.categoryId ? String(form.categoryId) : ""} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: Number(v) }))}>
                  <SelectTrigger data-testid="select-category"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.category_id} value={String(c.category_id)}>{c.category_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Product Type</Label>
                <Select value={form.productType} onValueChange={(v) => setForm((f) => ({ ...f, productType: v as "MILK" | "VAP" }))}>
                  <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
                  <SelectContent>{PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Base Unit</Label>
                <Select value={form.baseUomId ? String(form.baseUomId) : ""} onValueChange={(v) => setForm((f) => ({ ...f, baseUomId: Number(v) }))}>
                  <SelectTrigger data-testid="select-unit"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {(uoms ?? []).map((u) => (
                      <SelectItem key={u.uom_id} value={String(u.uom_id)}>{u.uom_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="btn-save-product">
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editId ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
