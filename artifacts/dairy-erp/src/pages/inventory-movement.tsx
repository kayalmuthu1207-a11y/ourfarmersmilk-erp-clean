import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInventoryMovements } from "@/hooks/useInventoryMovements";

// Movement types whose quantity represents stock going OUT (negative flow).
// Determined from real schema naming conventions; adjust if observed differently.
const OUT_TYPES = new Set(["DISPATCH", "SALE", "WASTAGE", "SPOILAGE", "ADJUSTMENT_OUT", "TRANSFER_OUT"]);

function qtyColor(movementType: string, quantity: number): string {
  // Positive quantity on an OUT type = stock leaving
  const isOut = OUT_TYPES.has(movementType.toUpperCase());
  return isOut ? "text-destructive" : "text-green-600";
}

function qtyDisplay(movementType: string, quantity: number): string {
  const isOut = OUT_TYPES.has(movementType.toUpperCase());
  const sign = isOut ? "-" : "+";
  return `${sign}${Math.abs(quantity).toLocaleString()}`;
}

function movementBadgeClass(type: string): string {
  const t = type.toUpperCase();
  if (t.includes("DISPATCH") || t.includes("SALE") || t.includes("OUT")) return "bg-red-100 text-red-800 border-red-200";
  if (t.includes("PRODUCTION") || t.includes("PURCHASE") || t.includes("IN")) return "bg-green-100 text-green-800 border-green-200";
  if (t.includes("ADJUST")) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-muted text-muted-foreground";
}

export default function InventoryMovement() {
  const { data: movements, isLoading, error } = useInventoryMovements();
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [productSearch, setProductSearch] = useState("");

  const distinctTypes = useMemo(() => {
    if (!movements) return [];
    return Array.from(new Set(movements.map((m) => m.movement_type))).sort();
  }, [movements]);

  const filtered = useMemo(() => {
    if (!movements) return [];
    return movements.filter((m) => {
      if (typeFilter !== "ALL" && m.movement_type !== typeFilter) return false;
      if (productSearch) {
        const name = m.product_master?.product_name ?? "";
        if (!name.toLowerCase().includes(productSearch.toLowerCase())) return false;
      }
      return true;
    });
  }, [movements, typeFilter, productSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Movement Ledger</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Read-only log of all stock movements. Entries are recorded automatically by other operations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="All movement types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All movement types</SelectItem>
                {distinctTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Search product…"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <p className="text-sm text-muted-foreground p-6 text-center">Loading…</p>
          )}
          {error && (
            <p className="text-sm text-destructive p-6 text-center">{(error as Error).message}</p>
          )}
          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Movement Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No movements found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((m) => (
                    <TableRow key={m.movement_id}>
                      <TableCell className="text-sm tabular-nums">{m.movement_date}</TableCell>
                      <TableCell className="font-medium text-sm">
                        {m.product_master?.product_name ?? `Product #${m.product_id}`}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${movementBadgeClass(m.movement_type)}`}>
                          {m.movement_type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-bold tabular-nums text-sm ${qtyColor(m.movement_type, m.quantity)}`}>
                        {qtyDisplay(m.movement_type, m.quantity)}
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
