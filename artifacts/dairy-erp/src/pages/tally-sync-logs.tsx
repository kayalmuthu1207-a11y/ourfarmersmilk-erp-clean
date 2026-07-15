import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, CheckCircle, XCircle } from "lucide-react";

const logs = Array.from({ length: 30 }, (_, i) => {
  const types = ["Sales Invoice", "Purchase Voucher", "Receipt Voucher", "Stock Entry", "Sales Order"];
  const status = i === 5 || i === 15 || i === 22 ? "Failed" : "Success";
  const hr = String(Math.floor(i / 3)).padStart(2, "0");
  const min = String((i * 7) % 60).padStart(2, "0");
  const amt = 5000 + (i * 4500) % 80000;
  return {
    id: `log${i}`,
    ts: `2026-07-03 0${hr}:${min}:${String(i * 3 % 60).padStart(2, "0")}`,
    type: types[i % types.length],
    ref: `${types[i % types.length].substring(0, 3).toUpperCase()}-2026-07-0${Math.max(1, 3 - Math.floor(i / 15))}-00${(i % 10) + 1}`,
    amount: amt,
    status,
    error: status === "Failed" ? ["Connection timeout", "Ledger not found", "Duplicate entry"][i % 3] : null,
    duration: status === "Failed" ? "30.0s" : `${(0.7 + (i % 5) * 0.3).toFixed(1)}s`,
  };
});

const statusBadge: Record<string, string> = {
  Success: "bg-green-100 text-green-800 border-green-200",
  Failed: "bg-red-100 text-red-800 border-red-200",
};

export default function TallySyncLogs() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sync Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Complete log of all Tally sync operations</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="today"><SelectTrigger className="w-36" data-testid="filter-date"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="today">Today</SelectItem><SelectItem value="yesterday">Yesterday</SelectItem><SelectItem value="week">This Week</SelectItem></SelectContent>
          </Select>
          <Button variant="outline" data-testid="btn-export"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id} className={l.status === "Failed" ? "bg-red-50/30" : ""}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{l.ts}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{l.type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{l.ref}</TableCell>
                  <TableCell className="text-right">₹{l.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {l.status === "Success" ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                      <Badge className={statusBadge[l.status]}>{l.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{l.duration}</TableCell>
                  <TableCell className="text-xs text-destructive">{l.error || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
