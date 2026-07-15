import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { useAuditLogs } from "@/hooks/useAuditLogs";

export default function AuditLogs() {
  const { data: logs, isLoading, isError, error } = useAuditLogs();
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("all");

  const list = logs ?? [];

  const tableNames = useMemo(
    () => Array.from(new Set(list.map((l) => l.table_name))).sort(),
    [list],
  );

  const filtered = list.filter((l) => {
    const matchTable = tableFilter === "all" || l.table_name === tableFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.table_name.toLowerCase().includes(q) ||
      (l.change_summary ?? "").toLowerCase().includes(q) ||
      (l.users?.full_name ?? "").toLowerCase().includes(q);
    return matchTable && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">Full audit trail of all data changes across the ERP</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search table, user, description..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="search-logs"
              />
            </div>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-48" data-testid="filter-table">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {tableNames.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading audit logs…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load audit logs</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Changed At</TableHead>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Change Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">No audit log entries found</TableCell>
                  </TableRow>
                ) : filtered.map((l) => (
                  <TableRow key={l.audit_id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{l.changed_at}</TableCell>
                    <TableCell><Badge variant="outline">{l.table_name}</Badge></TableCell>
                    <TableCell className="text-sm">{l.record_id}</TableCell>
                    <TableCell className="text-sm font-medium">{l.users?.full_name ?? "System"}</TableCell>
                    <TableCell className="text-sm max-w-[360px]">{l.change_summary ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
