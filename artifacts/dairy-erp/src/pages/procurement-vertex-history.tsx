import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info, Loader2, AlertTriangle } from "lucide-react";
import { useVertexImportBatches } from "@/hooks/useVertexImportBatches";

export default function VertexImportHistory() {
  const { data: batches, isLoading, isError, error } = useVertexImportBatches();
  const list = batches ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vertex Import History</h1>
        <p className="text-muted-foreground text-sm mt-1">Farmer milk collection data imported from Vertex DPU</p>
      </div>

      <div className="rounded-lg border bg-blue-50/60 border-blue-200 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          Automated Vertex CSV import isn't built yet — collection records are currently entered manually via
          Village Collection → Add Collection Record.
        </p>
      </div>
      {/* TODO: build Vertex CSV import/upload as a separate pass (file parsing) */}

      <Card>
        <CardHeader>
          <CardTitle>Import Batches</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading import batches…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load import batches</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Imported At</TableHead>
                  <TableHead className="text-right">Records</TableHead>
                  <TableHead className="text-right">Total Qty (L)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((b) => (
                  <TableRow key={b.import_batch_id}>
                    <TableCell className="font-mono font-medium">{b.import_batch_id}</TableCell>
                    <TableCell className="text-sm">{b.imported_at}</TableCell>
                    <TableCell className="text-right">{b.record_count}</TableCell>
                    <TableCell className="text-right font-medium">{b.total_qty.toLocaleString()} L</TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No import batches found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
