import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventoryBalances } from "@/hooks/useInventoryBalances";
import { useProducts } from "@/hooks/useProducts";

type SortKey = "product_name" | "category" | "uom" | "quantity";
type SortDir = "asc" | "desc";

export default function StockDashboard() {
  const { data: balanceMap, isLoading: balancesLoading } = useInventoryBalances();
  const { data: products, isLoading: productsLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("product_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const isLoading = balancesLoading || productsLoading;

  const rows = useMemo(() => {
    if (!products) return [];
    return products.map((p) => ({
      product_id: p.product_id,
      product_name: p.product_name,
      category: p.product_category?.category_name ?? "—",
      uom: p.uom_master?.uom_name ?? "—",
      quantity: balanceMap?.get(p.product_id) ?? 0,
    }));
  }, [products, balanceMap]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows
      .filter(
        (r) =>
          !q ||
          r.product_name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const mul = sortDir === "asc" ? 1 : -1;
        if (sortKey === "quantity") return (a.quantity - b.quantity) * mul;
        return a[sortKey].localeCompare(b[sortKey]) * mul;
      });
  }, [rows, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function SortBtn({ col }: { col: SortKey }) {
    return (
      <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => toggleSort(col)}>
        <ArrowUpDown className={`h-3 w-3 ${sortKey === col ? "text-primary" : "text-muted-foreground"}`} />
      </Button>
    );
  }

  const totalSkus = rows.length;
  const inStock = rows.filter((r) => r.quantity > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Current inventory quantities from live balances</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total SKUs</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold">{totalSkus}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">With Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{isLoading ? "—" : inStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Zero Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">{isLoading ? "—" : totalSkus - inStock}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm">All Products</CardTitle>
            <Input
              placeholder="Search product or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground p-6 text-center">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Product <SortBtn col="product_name" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Category <SortBtn col="category" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      UOM <SortBtn col="uom" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Quantity <SortBtn col="quantity" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.product_id}>
                      <TableCell className="font-medium">{r.product_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.category}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.uom}</TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {r.quantity.toLocaleString()}
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
