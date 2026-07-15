import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, AlertTriangle, Search, ChevronRight } from "lucide-react";
import { useOrderHistory, type OrderHistoryRow } from "@/hooks/useOrderHistory";

const orderTypeBadge: Record<string, string> = {
  REGULAR: "bg-blue-50 text-blue-700 border-blue-200",
  VAP: "bg-purple-50 text-purple-700 border-purple-200",
};

const vapStatusBadge: Record<string, string> = {
  PENDING_CONFIRMATION: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  NOT_AVAILABLE: "bg-red-50 text-red-700 border-red-200",
};

function orderTotal(row: OrderHistoryRow) {
  return row.customer_order_line.reduce((s, l) => s + l.line_amount, 0);
}

export default function OrdersHistory() {
  const { data: orders, isLoading, isError, error } = useOrderHistory();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailOrder, setDetailOrder] = useState<OrderHistoryRow | null>(null);

  const list = orders ?? [];

  const statuses = useMemo(() => {
    const set = new Set(list.map((o) => o.order_status));
    return Array.from(set).sort();
  }, [list]);

  const filtered = list.filter((o) => {
    const matchesSearch = search.trim()
      ? (o.customer_master?.customer_name ?? "").toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesStatus = statusFilter === "all" || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Order History</h1>
        <p className="text-muted-foreground text-sm mt-1">Most recent 300 orders, newest first.</p>
      </div>

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Orders Shown</p>
              <p className="text-2xl font-bold mt-1">{list.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">VAP Orders</p>
              <p className="text-2xl font-bold mt-1">{list.filter((o) => o.order_type === "VAP").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Same-Day</p>
              <p className="text-2xl font-bold mt-1">{list.filter((o) => o.is_same_day).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold mt-1">₹{list.reduce((s, o) => s + orderTotal(o), 0).toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="text-base">Orders</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-orders"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44" data-testid="select-status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading orders…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load orders</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((o) => (
                    <TableRow
                      key={o.order_id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setDetailOrder(o)}
                    >
                      <TableCell className="font-medium text-primary">#{o.order_id}</TableCell>
                      <TableCell className="text-sm">{o.order_date}</TableCell>
                      <TableCell className="font-medium">
                        {o.customer_master?.customer_name ?? `Customer`}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                        {o.delivery_location?.location_name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${orderTypeBadge[o.order_type] ?? ""}`}>
                          {o.order_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {o.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{o.customer_order_line.length}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{orderTotal(o).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Line-item detail dialog */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        {detailOrder && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Order #{detailOrder.order_id} — {detailOrder.customer_master?.customer_name ?? "Customer"}
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground space-y-0.5 pb-2">
              <p>Date: {detailOrder.order_date} · {detailOrder.delivery_location?.location_name ?? "No location"}</p>
              <p>Status: {detailOrder.order_status} · Type: {detailOrder.order_type}</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>VAP Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailOrder.customer_order_line.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      No line items.
                    </TableCell>
                  </TableRow>
                ) : (
                  detailOrder.customer_order_line.map((line) => (
                    <TableRow key={line.order_line_id}>
                      <TableCell className="font-medium">
                        {line.product_master?.product_name ?? `Product #${line.product_id}`}
                      </TableCell>
                      <TableCell className="text-right">{line.ordered_qty}</TableCell>
                      <TableCell className="text-right">₹{line.unit_price.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">₹{line.line_amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        {line.vap_confirmation_status ? (
                          <Badge
                            variant="outline"
                            className={`text-xs ${vapStatusBadge[line.vap_confirmation_status] ?? ""}`}
                          >
                            {line.vap_confirmation_status}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center pt-2 border-t text-sm font-semibold">
              <span>Total</span>
              <span>₹{orderTotal(detailOrder).toLocaleString("en-IN")}</span>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailOrder(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
