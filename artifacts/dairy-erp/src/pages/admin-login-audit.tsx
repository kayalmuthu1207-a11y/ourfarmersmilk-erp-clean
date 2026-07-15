import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Shield, AlertTriangle } from "lucide-react";

const logs = [
  { id: "l1", ts: "2026-07-03 09:12:34", user: "Ops Manager (Owner)", role: "Owner", ip: "192.168.1.10", device: "Chrome 126 / Windows 11", status: "Success", duration: "4h 12m", logout: "13:24" },
  { id: "l2", ts: "2026-07-03 08:45:11", user: "Ravi Kumar (Manager)", role: "Manager", ip: "192.168.1.22", device: "Chrome 126 / macOS", status: "Success", duration: "Active", logout: "—" },
  { id: "l3", ts: "2026-07-03 08:30:05", user: "Priya S (Accountant)", role: "Accountant", ip: "192.168.1.35", device: "Firefox 127 / Windows 10", status: "Success", duration: "Active", logout: "—" },
  { id: "l4", ts: "2026-07-03 07:55:48", user: "Suresh K (Delivery)", role: "Delivery Manager", ip: "192.168.1.55", device: "Chrome Mobile / Android", status: "Success", duration: "2h 45m", logout: "10:40" },
  { id: "l5", ts: "2026-07-03 07:30:22", user: "Unknown", role: "—", ip: "103.45.67.89", device: "Chrome 125 / Unknown", status: "Failed", duration: "—", logout: "—" },
  { id: "l6", ts: "2026-07-03 07:29:58", user: "Unknown", role: "—", ip: "103.45.67.89", device: "Chrome 125 / Unknown", status: "Failed", duration: "—", logout: "—" },
  { id: "l7", ts: "2026-07-03 06:15:33", user: "Karthik M (Counter)", role: "Counter Staff", ip: "192.168.1.70", device: "Safari / iOS", status: "Success", duration: "3h 20m", logout: "09:35" },
  { id: "l8", ts: "2026-07-02 20:45:10", user: "Ops Manager (Owner)", role: "Owner", ip: "10.0.0.5", device: "Chrome 126 / macOS", status: "Success", duration: "1h 05m", logout: "21:50" },
  { id: "l9", ts: "2026-07-02 18:30:44", user: "Ravi Kumar (Manager)", role: "Manager", ip: "192.168.1.22", device: "Chrome 126 / macOS", status: "Success", duration: "2h 15m", logout: "20:45" },
  { id: "l10", ts: "2026-07-02 15:22:18", user: "Priya S (Accountant)", role: "Accountant", ip: "192.168.1.35", device: "Firefox 127 / Windows 10", status: "Success", duration: "3h 45m", logout: "19:07" },
  { id: "l11", ts: "2026-07-02 10:05:55", user: "Unknown", role: "—", ip: "45.33.22.11", device: "Python-requests / Linux", status: "Blocked", duration: "—", logout: "—" },
  { id: "l12", ts: "2026-07-01 08:00:12", user: "Arjun P (Driver)", role: "Delivery Manager", ip: "192.168.1.88", device: "Chrome Mobile / Android", status: "Success", duration: "4h 30m", logout: "12:30" },
];

const statusBadge: Record<string, string> = {
  Success: "bg-green-100 text-green-800 border-green-200",
  Failed: "bg-red-100 text-red-800 border-red-200",
  Blocked: "bg-orange-100 text-orange-800 border-orange-200",
};

export default function LoginAudit() {
  const stats = {
    today: logs.filter((l) => l.ts.startsWith("2026-07-03")).length,
    failed: logs.filter((l) => l.status === "Failed").length,
    active: logs.filter((l) => l.duration === "Active").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Login Audit</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete record of all login attempts and session activity</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Logins Today</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.today}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Failed Attempts</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-destructive">{stats.failed}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Sessions</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{stats.active}</p></CardContent></Card>
      </div>

      {logs.filter((l) => l.status !== "Success").length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Suspicious activity detected</p>
              <p className="text-xs text-amber-700 mt-0.5">Multiple failed login attempts from 103.45.67.89 and 45.33.22.11. These IPs have been automatically blocked after 3 failed attempts.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search user or IP..." className="pl-9" data-testid="search-logs" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-36" data-testid="filter-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {["Success","Failed","Blocked"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Device / Browser</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Session Duration</TableHead>
                <TableHead>Logout</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id} className={l.status !== "Success" ? "bg-red-50/30" : ""}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{l.ts}</TableCell>
                  <TableCell className="font-medium text-sm">{l.user}</TableCell>
                  <TableCell className="text-sm">{l.role !== "—" ? l.role : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="font-mono text-xs">{l.ip}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.device}</TableCell>
                  <TableCell><Badge className={statusBadge[l.status]}>{l.status}</Badge></TableCell>
                  <TableCell className="text-sm">{l.duration === "Active" ? <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge> : l.duration}</TableCell>
                  <TableCell className="text-sm">{l.logout}</TableCell>
                  <TableCell>
                    {l.status !== "Success" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" data-testid={`block-${l.id}`}>
                        <Shield className="h-3 w-3 mr-1" />Block IP
                      </Button>
                    )}
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
