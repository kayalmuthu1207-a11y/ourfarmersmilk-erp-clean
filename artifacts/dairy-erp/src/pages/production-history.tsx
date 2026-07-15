import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useProductionHistory } from "@/hooks/useProductionHistory";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export default function ProductionHistory() {
  const { data: batches, isLoading, error } = useProductionHistory();
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(new Date().toISOString().split("T")[0]);

  const filtered = useMemo(() => {
    if (!batches) return [];
    return batches.filter((b) => b.production_date >= from && b.production_date <= to);
  }, [batches, from, to]);

  // Daily totals for chart
  const dailyTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of filtered) {
      const qty = b.production_batch_line.reduce((s, l) => s + Number(l.produced_qty), 0);
      map.set(b.production_date, (map.get(b.production_date) ?? 0) + qty);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, qty]) => ({ date: date.slice(5), qty })); // MM-DD for display
  }, [filtered]);

  // Per-product breakdown
  const productBreakdown = useMemo(() => {
    const map = new Map<string, { produced: number; spoiled: number }>();
    for (const b of filtered) {
      for (const l of b.production_batch_line) {
        const name = l.product_master?.product_name ?? `Product #${l.product_id}`;
        const existing = map.get(name) ?? { produced: 0, spoiled: 0 };
        map.set(name, {
          produced: existing.produced + Number(l.produced_qty),
          spoiled: existing.spoiled + Number(l.spoilage_qty),
        });
      }
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.produced - a.produced);
  }, [filtered]);

  const totalProduced = productBreakdown.reduce((s, r) => s + r.produced, 0);
  const totalSpoiled = productBreakdown.reduce((s, r) => s + r.spoiled, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Production History</h1>
        <p className="text-muted-foreground text-sm mt-1">Daily volume trend and per-product breakdown</p>
      </div>

      {/* Date range filter */}
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
            <div className="text-sm text-muted-foreground pb-1">
              {filtered.length} batch{filtered.length !== 1 ? "es" : ""} in range
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Produced</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? "—" : totalProduced.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spoilage</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">{isLoading ? "—" : totalSpoiled.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Batches</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? "—" : filtered.length}</p></CardContent>
        </Card>
      </div>

      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {!isLoading && dailyTotals.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Daily Total Produced</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyTotals}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Produced" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Per-Product Breakdown</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground p-6 text-center">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Total Produced</TableHead>
                  <TableHead className="text-right">Total Spoiled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                      No production data in range
                    </TableCell>
                  </TableRow>
                ) : (
                  productBreakdown.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right tabular-nums font-bold">{r.produced.toLocaleString()}</TableCell>
                      <TableCell className={`text-right tabular-nums ${r.spoiled > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                        {r.spoiled.toLocaleString()}
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
