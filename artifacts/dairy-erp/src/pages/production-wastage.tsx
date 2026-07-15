import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProductionHistory } from "@/hooks/useProductionHistory";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export default function ProductionWastage() {
  const { data: batches, isLoading, error } = useProductionHistory();
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(new Date().toISOString().split("T")[0]);

  const filtered = useMemo(() => {
    if (!batches) return [];
    return batches.filter((b) => b.production_date >= from && b.production_date <= to);
  }, [batches, from, to]);

  // Only lines with spoilage > 0
  const spoilageLines = useMemo(() => {
    return filtered.flatMap((b) =>
      b.production_batch_line.filter((l) => Number(l.spoilage_qty) > 0),
    );
  }, [filtered]);

  const allLines = useMemo(() => {
    return filtered.flatMap((b) => b.production_batch_line);
  }, [filtered]);

  const totalProduced = allLines.reduce((s, l) => s + Number(l.produced_qty), 0);
  const totalSpoiled = spoilageLines.reduce((s, l) => s + Number(l.spoilage_qty), 0);
  const wastageRate = totalProduced > 0 ? ((totalSpoiled / totalProduced) * 100).toFixed(2) : "0.00";

  // Per-product spoilage breakdown
  const byProduct = useMemo(() => {
    const map = new Map<string, { produced: number; spoiled: number }>();
    for (const l of allLines) {
      const name = l.product_master?.product_name ?? `Product #${l.product_id}`;
      const existing = map.get(name) ?? { produced: 0, spoiled: 0 };
      map.set(name, {
        produced: existing.produced + Number(l.produced_qty),
        spoiled: existing.spoiled + Number(l.spoilage_qty),
      });
    }
    return Array.from(map.entries())
      .filter(([, v]) => v.spoiled > 0)
      .map(([name, v]) => ({
        name,
        ...v,
        rate: v.produced > 0 ? ((v.spoiled / v.produced) * 100).toFixed(2) : "0.00",
      }))
      .sort((a, b) => b.spoiled - a.spoiled);
  }, [allLines]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Production Wastage</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Spoilage summary from production batches. Quantities only — no currency value shown (no cost field on product master).
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label htmlFor="from-date">From</Label>
              <Input id="from-date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-40" />
            </div>
            <div>
              <Label htmlFor="to-date">To</Label>
              <Input id="to-date" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spoilage (units)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">{isLoading ? "—" : totalSpoiled.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Wastage Rate</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">{isLoading ? "—" : `${wastageRate}%`}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Produced</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? "—" : totalProduced.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Per-Product Spoilage Breakdown</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground p-6 text-center">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Produced</TableHead>
                  <TableHead className="text-right">Spoiled</TableHead>
                  <TableHead className="text-right">Spoilage Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byProduct.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No spoilage recorded in range
                    </TableCell>
                  </TableRow>
                ) : (
                  byProduct.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.produced.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums text-amber-600 font-bold">{r.spoiled.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums text-amber-600">{r.rate}%</TableCell>
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
