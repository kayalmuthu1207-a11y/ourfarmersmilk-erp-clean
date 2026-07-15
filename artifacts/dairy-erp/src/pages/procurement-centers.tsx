import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { useVillages } from "@/hooks/useVillages";

interface VillageFarmerCount {
  village_id: number;
  count: number;
}

function useVillageFarmerCounts() {
  return useQuery({
    queryKey: ["village-farmer-counts"],
    queryFn: async (): Promise<Map<number, number>> => {
      // Count enrolled farmers grouped by village_id
      const { data, error } = await supabase
        .from("farmer_master")
        .select("village_id");
      if (error) throw new Error(error.message);
      const counts = new Map<number, number>();
      for (const row of data) {
        counts.set(row.village_id, (counts.get(row.village_id) ?? 0) + 1);
      }
      return counts;
    },
  });
}

export default function ProcurementCenters() {
  const { data: villages, isLoading: villagesLoading } = useVillages();
  const { data: farmerCounts, isLoading: countsLoading } = useVillageFarmerCounts();
  const isLoading = villagesLoading || countsLoading;

  const rows = villages?.map((v) => ({
    village_id: v.village_id,
    village_name: v.village_name,
    farmer_count: farmerCounts?.get(v.village_id) ?? 0,
  })) ?? [];

  const sorted = [...rows].sort((a, b) => b.farmer_count - a.farmer_count);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Collection Centers</h1>
        <p className="text-muted-foreground text-sm mt-1">Village enrollment overview</p>
      </div>

      <div className="rounded border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm text-blue-800">
        Centers map 1:1 to villages in this system — there's no separate collection-center entity.
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Villages</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? "—" : rows.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Enrolled Farmers</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {isLoading ? "—" : rows.reduce((s, r) => s + r.farmer_count, 0).toLocaleString()}
            </p>
          </CardContent>
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
                  <TableHead>Village Name</TableHead>
                  <TableHead className="text-right">Enrolled Farmers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                      No villages found
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((r) => (
                    <TableRow key={r.village_id}>
                      <TableCell className="font-medium">{r.village_name}</TableCell>
                      <TableCell className="text-right tabular-nums font-bold">{r.farmer_count.toLocaleString()}</TableCell>
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
