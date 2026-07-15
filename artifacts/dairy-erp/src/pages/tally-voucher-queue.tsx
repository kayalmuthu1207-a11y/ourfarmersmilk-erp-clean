import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Play, Trash2, Clock } from "lucide-react";

const queue = [
  { id: "q1", addedAt: "2026-07-03 09:35:00", type: "Purchase Voucher", ref: "PV-2026-07-03-001", amount: 45200, priority: "Normal", retries: 0, nextRetry: "09:50:00", status: "Queued" },
  { id: "q2", addedAt: "2026-07-03 09:38:00", type: "Sales Invoice", ref: "INV-2220", amount: 18500, priority: "High", retries: 3, nextRetry: "10:05:00", status: "Retrying" },
  { id: "q3", addedAt: "2026-07-03 09:40:00", type: "Stock Entry", ref: "BATCH-03-006", amount: 0, priority: "Normal", retries: 0, nextRetry: "09:55:00", status: "Queued" },
  { id: "q4", addedAt: "2026-07-03 09:42:00", type: "Sales Order", ref: "SO-2026-07-03-010", amount: 12400, priority: "Low", retries: 0, nextRetry: "10:00:00", status: "Queued" },
  { id: "q5", addedAt: "2026-07-03 09:45:00", type: "Receipt Voucher", ref: "RV-2026-07-03-002", amount: 50000, priority: "High", retries: 0, nextRetry: "09:48:00", status: "Processing" },
];

const statusBadge: Record<string, string> = {
  Queued: "bg-gray-100 text-gray-700 border-gray-200",
  Retrying: "bg-amber-100 text-amber-800 border-amber-200",
  Processing: "bg-blue-100 text-blue-800 border-blue-200",
  Failed: "bg-red-100 text-red-800 border-red-200",
};
const priorityBadge: Record<string, string> = {
  High: "bg-red-100 text-red-800 border-red-200",
  Normal: "bg-gray-100 text-gray-700 border-gray-200",
  Low: "bg-green-100 text-green-800 border-green-200",
};

export default function TallyVoucherQueue() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Voucher Sync Queue</h1>
          <p className="text-muted-foreground text-sm mt-1">Pending vouchers awaiting sync to TallyPrime</p>
        </div>
        <Button data-testid="btn-process-all"><Play className="h-4 w-4 mr-2" />Process All Now</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Queue</CardTitle></CardHeader><CardContent className="flex items-center gap-2"><Clock className="h-5 w-5 text-muted-foreground" /><p className="text-2xl font-bold">{queue.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Processing</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-blue-600">{queue.filter((q) => q.status === "Processing").length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Retrying</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-600">{queue.filter((q) => q.status === "Retrying").length}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Added At</TableHead>
                <TableHead>Voucher Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Retries</TableHead>
                <TableHead>Next Retry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{q.addedAt}</TableCell>
                  <TableCell><Badge variant="outline">{q.type}</Badge></TableCell>
                  <TableCell className="font-mono text-sm">{q.ref}</TableCell>
                  <TableCell className="text-right">{q.amount > 0 ? `₹${q.amount.toLocaleString()}` : "—"}</TableCell>
                  <TableCell><Badge className={priorityBadge[q.priority]}>{q.priority}</Badge></TableCell>
                  <TableCell className="text-right">{q.retries}</TableCell>
                  <TableCell className="font-mono text-sm">{q.nextRetry}</TableCell>
                  <TableCell><Badge className={statusBadge[q.status]}>{q.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" data-testid={`retry-${q.id}`}><RefreshCw className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" data-testid={`remove-${q.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
