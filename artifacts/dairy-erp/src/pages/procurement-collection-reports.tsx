import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

interface VillageRangeSummary {
  village_id: number;
  village_name: string;
  farmer_count: number;
  total_qty: number;
}

function useVillageCollectionRange(from: string, to: string) {
  return useQuery({
    queryKey: ["village-collection-range", from, to],
    queryFn: async (): Promise<VillageRangeSummary[]> => {
      const { data: villages, error: villagesError } = await supabase
        .from("village_master")
        .select("village_id, village_name");
      if (villagesError) throw new Error(villagesError.message);

      const { data: records, error: recordsError } = await supabase
        .from("milk_collection_record")
        .select("village_id, farmer_id, quantity")
        .gte("collection_date", from)
        .lte("collection_date", to);
      if (recordsError) throw new Error(recordsError.message);

      return villages.map((v) => {
        const villageRecords = records.filter((r) => r.village_id === v.village_id);
        return {
          village_id: v.village_id,
          village_name: v.village_name,
          farmer_count: new Set(villageRecords.map((r) => r.farmer_id)).size,
          total_qty: villageRecords.reduce((s, r) => s + Number(r.quantity), 0),
        };
      });
    },
    enabled: !!from && !!to && from <= to,
  });
}

export default function CollectionReports() {
  const [from, setFrom] = useState(daysAgo(7));
  const [to, setTo] = useState(new Date().toISOString().split("T")[0]);
  const { data: summary, isLoading, error } = useVillageCollectionRange(from, to);

  const sorted = useMemo(() => {
    if (!summary) return [];
    return [...summary].sort((a, b) => b.total_qty - a.total_qty);
  }, [summary]);

  const totalQty = sorted.reduce((s, r) => s + r.total_qty, 0);
  const totalFarmers = sorted.reduce((s, r) => s + r.farmer_count, 0);
  const activeVillages = sorted.filter((r) => r.total_qty > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Collection Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Aggregated milk procurement by village across a date range</p>
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
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Quantity</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? "—" : totalQty.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Unique Farmers</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? "—" : totalFarmers.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Villages</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? "—" : activeVillages}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground p-6 text-center">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Village</TableHead>
                  <TableHead className="text-right">Farmers</TableHead>
                  <TableHead className="text-right">Total Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                      No data for selected range
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((r) => (
                    <TableRow key={r.village_id} className={r.total_qty === 0 ? "opacity-50" : ""}>
                      <TableCell className="font-medium">{r.village_name}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.farmer_count}</TableCell>
                      <TableCell className="text-right tabular-nums font-bold">
                        {r.total_qty.toLocaleString()}
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
