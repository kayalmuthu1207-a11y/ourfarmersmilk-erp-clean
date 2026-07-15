import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { RefreshCw, CheckSquare, XCircle } from "lucide-react";

const failures = [
  { id: "f1", num: "FAIL-0088", date: "2026-07-03 08:45", type: "Sales Invoice", ref: "INV-2220", amount: 18500, error: "Connection timeout after 30s", retries: 3, lastRetry: "2026-07-03 09:30", status: "Failed" },
  { id: "f2", num: "FAIL-0087", date: "2026-07-03 07:20", type: "Purchase Voucher", ref: "PV-2026-07-03-001", amount: 45200, error: "Ledger 'Mullipakam Village' not found in Tally", retries: 1, lastRetry: "2026-07-03 07:25", status: "Failed" },
  { id: "f3", num: "FAIL-0086", date: "2026-07-02 18:10", type: "Receipt Voucher", ref: "RV-2026-07-02-003", amount: 25000, error: "Duplicate voucher reference", retries: 2, lastRetry: "2026-07-02 18:30", status: "Retrying" },
  { id: "f4", num: "FAIL-0085", date: "2026-07-02 10:35", type: "Stock Entry", ref: "BATCH-02-003", amount: 0, error: "Invalid stock item: 'Toned Milk 500 ml'", retries: 4, lastRetry: "2026-07-02 12:00", status: "Resolved" },
  { id: "f5", num: "FAIL-0084", date: "2026-07-01 20:15", type: "Sales Invoice", ref: "INV-2215", amount: 12800, error: "Connection timeout after 30s", retries: 3, lastRetry: "2026-07-01 21:00", status: "Resolved" },
  { id: "f6", num: "FAIL-0083", date: "2026-07-01 15:40", type: "Sales Order", ref: "SO-2026-07-01-005", amount: 8400, error: "Amount format error: currency mismatch", retries: 1, lastRetry: "2026-07-01 16:00", status: "Resolved" },
];

const errorBreakdown = [
  { name: "Connection Timeout", value: 40, color: "#dc2626" },
  { name: "Ledger Not Found", value: 30, color: "#d97706" },
  { name: "Duplicate Voucher", value: 20, color: "#2563eb" },
  { name: "Other", value: 10, color: "#9ca3af" },
];

const statusBadge: Record<string, string> = {
  Failed: "bg-red-100 text-red-800 border-red-200",
  Retrying: "bg-amber-100 text-amber-800 border-amber-200",
  Resolved: "bg-green-100 text-green-800 border-green-200",
};

export default function TallyFailed() {
  const stats = { total: 18, resolved: 15, pending: 3 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Failed Sync Records</h1>
          <p className="text-muted-foreground text-sm mt-1">TallyPrime sync failures requiring attention</p>
        </div>
        <Button data-testid="btn-retry-all"><RefreshCw className="h-4 w-4 mr-2" />Retry All Failed</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Failures (Month)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{stats.resolved}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Still Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-destructive">{stats.pending}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Error Type Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={errorBreakdown} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${value}%`} labelLine={false} fontSize={11}>
                  {errorBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Common Fixes</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { error: "Connection Timeout", fix: "Check Tally server status and port 9000 connectivity. Retry after 5 minutes." },
              { error: "Ledger Not Found", fix: "Verify ledger name in Tally matches exactly. Contact accountant to create missing ledger." },
              { error: "Duplicate Voucher", fix: "Check if voucher was already manually entered in Tally. Mark as Resolved if so." },
              { error: "Amount Format Error", fix: "Verify currency settings in Tally match ERP. Check for trailing spaces in amounts." },
            ].map((c, i) => (
              <div key={i} className="border rounded p-2">
                <p className="font-medium text-xs">{c.error}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.fix}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Failure#</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Voucher Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Error</TableHead>
                <TableHead className="text-right">Retries</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {failures.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-sm">{f.num}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{f.date}</TableCell>
                  <TableCell><Badge variant="outline">{f.type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{f.ref}</TableCell>
                  <TableCell className="text-right">{f.amount > 0 ? `₹${f.amount.toLocaleString()}` : "—"}</TableCell>
                  <TableCell className="text-xs text-destructive max-w-[200px]">{f.error}</TableCell>
                  <TableCell className="text-right">{f.retries}</TableCell>
                  <TableCell><Badge className={statusBadge[f.status]}>{f.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {f.status !== "Resolved" && <Button size="sm" variant="outline" className="h-7 text-xs" data-testid={`retry-${f.id}`}><RefreshCw className="h-3 w-3 mr-1" />Retry</Button>}
                      {f.status !== "Resolved" && <Button size="sm" variant="ghost" className="h-7 text-xs" data-testid={`resolve-${f.id}`}><CheckSquare className="h-3 w-3 mr-1" />Resolve</Button>}
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
