import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useProductionHistory } from "@/hooks/useProductionHistory";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export default function ProductionBatchTracking() {
  const { data: batches, isLoading, error } = useProductionHistory();
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(new Date().toISOString().split("T")[0]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    if (!batches) return [];
    return batches.filter((b) => b.production_date >= from && b.production_date <= to);
  }, [batches, from, to]);

  function toggleRow(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Production Batch Tracking</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All recorded production batches. Expand a row to see per-product lines.
        </p>
      </div>

      <div className="rounded border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-800">
        Batch status/QC tracking isn't in the schema yet — this shows batches as recorded.
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

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground p-6 text-center">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total Produced</TableHead>
                  <TableHead className="text-right">Total Spoiled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No batches in range
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((batch) => {
                    const totalProduced = batch.production_batch_line.reduce((s, l) => s + Number(l.produced_qty), 0);
                    const totalSpoiled = batch.production_batch_line.reduce((s, l) => s + Number(l.spoilage_qty), 0);
                    const isOpen = expanded.has(batch.batch_id);

                    return (
                      <>
                        <TableRow
                          key={batch.batch_id}
                          className="cursor-pointer hover:bg-muted/40"
                          onClick={() => toggleRow(batch.batch_id)}
                        >
                          <TableCell className="text-muted-foreground">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </TableCell>
                          <TableCell className="font-medium tabular-nums">{batch.production_date}</TableCell>
                          <TableCell className="text-right tabular-nums">{batch.production_batch_line.length}</TableCell>
                          <TableCell className="text-right tabular-nums font-bold">{totalProduced.toLocaleString()}</TableCell>
                          <TableCell className={`text-right tabular-nums ${totalSpoiled > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                            {totalSpoiled.toLocaleString()}
                          </TableCell>
                        </TableRow>
                        {isOpen && batch.production_batch_line.map((line) => (
                          <TableRow key={line.batch_line_id} className="bg-muted/20">
                            <TableCell />
                            <TableCell className="text-xs text-muted-foreground pl-6" colSpan={1}>
                              Line #{line.batch_line_id}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground" colSpan={1}>
                              {line.product_master?.product_name ?? `Product #${line.product_id}`}
                            </TableCell>
                            <TableCell className="text-right text-xs tabular-nums">
                              {Number(line.produced_qty).toLocaleString()}
                            </TableCell>
                            <TableCell className={`text-right text-xs tabular-nums ${Number(line.spoilage_qty) > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                              {Number(line.spoilage_qty).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
