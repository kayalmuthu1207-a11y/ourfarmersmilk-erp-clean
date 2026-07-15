import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Wifi, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

const syncStats = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
  pushed: 18 + (i % 3) * 3,
  failed: i === 2 ? 3 : i === 5 ? 2 : 0,
}));

const recentSyncs = [
  { id: "s1", ts: "2026-07-03 09:32:15", type: "Sales Invoice", ref: "INV-2220", amount: 18500, status: "Success", duration: "1.2s" },
  { id: "s2", ts: "2026-07-03 09:30:44", type: "Sales Invoice", ref: "INV-2219", amount: 32400, status: "Success", duration: "0.9s" },
  { id: "s3", ts: "2026-07-03 09:28:10", type: "Purchase Voucher", ref: "PV-2026-07-03-001", amount: 45200, status: "Failed", duration: "30.0s" },
  { id: "s4", ts: "2026-07-03 09:15:22", type: "Receipt Voucher", ref: "RV-2026-07-03-001", amount: 2000, status: "Success", duration: "0.8s" },
  { id: "s5", ts: "2026-07-03 08:55:33", type: "Stock Entry", ref: "BATCH-03-001", amount: 0, status: "Success", duration: "2.1s" },
  { id: "s6", ts: "2026-07-03 08:45:19", type: "Sales Invoice", ref: "INV-2218", amount: 21500, status: "Success", duration: "1.0s" },
  { id: "s7", ts: "2026-07-03 08:30:05", type: "Sales Order", ref: "SO-2026-07-03-001", amount: 8400, status: "Success", duration: "0.7s" },
  { id: "s8", ts: "2026-07-03 08:15:44", type: "Purchase Voucher", ref: "PV-2026-07-03-000", amount: 38000, status: "Success", duration: "1.3s" },
];

const statusBadge: Record<string, string> = {
  Success: "bg-green-100 text-green-800 border-green-200",
  Failed: "bg-red-100 text-red-800 border-red-200",
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
};

export default function TallySyncDashboard() {
  const todaySuccess = recentSyncs.filter((s) => s.status === "Success").length;
  const todayFailed = recentSyncs.filter((s) => s.status === "Failed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tally Sync Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time TallyPrime synchronization status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Connected — TallyPrime Silver 7.1</span>
          </div>
          <Button variant="outline" data-testid="btn-force-sync"><RefreshCw className="h-4 w-4 mr-2" />Force Sync</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Synced Today", value: todaySuccess, icon: <CheckCircle className="h-4 w-4 text-green-600" />, color: "text-green-600" },
          { label: "Failed Today", value: todayFailed, icon: <XCircle className="h-4 w-4 text-destructive" />, color: "text-destructive" },
          { label: "Pending Queue", value: 2, icon: <Clock className="h-4 w-4 text-amber-500" />, color: "text-amber-600" },
          { label: "Avg Sync Time", value: "1.1s", icon: <Wifi className="h-4 w-4 text-primary" />, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2">{s.icon}<p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Sync Volume — Last 7 Days</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={syncStats}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="pushed" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" name="Pushed" />
              <Area type="monotone" dataKey="failed" stroke="#dc2626" fill="#dc262615" name="Failed" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Sync Activity</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Voucher Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSyncs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.ts}</TableCell>
                  <TableCell><Badge variant="outline">{s.type}</Badge></TableCell>
                  <TableCell className="font-mono text-sm">{s.ref}</TableCell>
                  <TableCell className="text-right">{s.amount > 0 ? `₹${s.amount.toLocaleString()}` : "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {s.status === "Success" ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                      <Badge className={statusBadge[s.status]}>{s.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{s.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
