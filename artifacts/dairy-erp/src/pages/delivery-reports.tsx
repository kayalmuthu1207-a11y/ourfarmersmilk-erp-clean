import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, AlertTriangle, Search, ChevronRight, AlertCircle } from "lucide-react";
import { useDispatchReports, type DispatchReportRow } from "@/hooks/useDispatchReports";

function hasShortfall(row: DispatchReportRow): boolean {
  return row.dispatch_line.some((l) => l.dispatched_base_qty < l.ordered_base_qty);
}

export default function DeliveryReports() {
  const { data: dispatches, isLoading, isError, error } = useDispatchReports();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailRow, setDetailRow] = useState<DispatchReportRow | null>(null);

  const list = dispatches ?? [];

  const filtered = useMemo(() => {
    return list.filter((d) => {
      const matchesSearch = search.trim()
        ? (d.customer_order?.customer_master?.customer_name ?? "").toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesFrom = dateFrom ? d.dispatch_date >= dateFrom : true;
      const matchesTo = dateTo ? d.dispatch_date <= dateTo : true;
      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [list, search, dateFrom, dateTo]);

  const shortfallCount = filtered.filter(hasShortfall).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dispatch Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Operational dispatch history — most recent 200 records. Rows with shortfalls are highlighted.
        </p>
      </div>

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Dispatches Shown</p>
              <p className="text-2xl font-bold mt-1">{filtered.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">With Shortfall</p>
              <p className={`text-2xl font-bold mt-1 ${shortfallCount > 0 ? "text-amber-600" : ""}`}>
                {shortfallCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total Lines</p>
              <p className="text-2xl font-bold mt-1">
                {filtered.reduce((s, d) => s + d.dispatch_line.length, 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="relative flex-1 min-w-0 sm:max-w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-dispatches"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-36"
                  data-testid="input-date-from"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-36"
                  data-testid="input-date-to"
                />
              </div>
              {(dateFrom || dateTo || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">Dispatch Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading dispatch records…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load dispatch records</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispatch Date</TableHead>
                  <TableHead>Dispatch ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Lines</TableHead>
                  <TableHead></TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      No dispatch records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => {
                    const shortfall = hasShortfall(d);
                    return (
                      <TableRow
                        key={d.dispatch_id}
                        className={`cursor-pointer hover:bg-muted/30 ${shortfall ? "bg-amber-50/50" : ""}`}
                        onClick={() => setDetailRow(d)}
                      >
                        <TableCell className="text-sm">{d.dispatch_date}</TableCell>
                        <TableCell className="font-medium text-primary">#{d.dispatch_id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">#{d.order_id}</TableCell>
                        <TableCell className="font-medium">
                          {d.customer_order?.customer_master?.customer_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm">{d.dispatch_line.length}</TableCell>
                        <TableCell>
                          {shortfall && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Shortfall
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Line-item detail dialog */}
      <Dialog open={!!detailRow} onOpenChange={() => setDetailRow(null)}>
        {detailRow && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Dispatch #{detailRow.dispatch_id} — {detailRow.dispatch_date}
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground pb-2">
              <p>Customer: {detailRow.customer_order?.customer_master?.customer_name ?? "—"}</p>
              <p>Order: #{detailRow.order_id}</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Dispatched</TableHead>
                  <TableHead className="text-right">Shortfall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailRow.dispatch_line.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No line items.
                    </TableCell>
                  </TableRow>
                ) : (
                  detailRow.dispatch_line.map((line) => {
                    const diff = line.ordered_base_qty - line.dispatched_base_qty;
                    return (
                      <TableRow key={line.dispatch_line_id} className={diff > 0 ? "bg-amber-50/60" : ""}>
                        <TableCell className="font-medium">
                          {line.product_master?.product_name ?? `Product #${line.product_id}`}
                        </TableCell>
                        <TableCell className="text-right">{line.ordered_base_qty}</TableCell>
                        <TableCell className="text-right">{line.dispatched_base_qty}</TableCell>
                        <TableCell className="text-right">
                          {diff > 0 ? (
                            <span className="font-semibold text-amber-700">–{diff}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailRow(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
