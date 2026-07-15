import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, AlertTriangle } from "lucide-react";
import { useCustomerPaymentsHistory } from "@/hooks/useCustomerPaymentsHistory";

export default function PaymentsHistory() {
  const { data: payments, isLoading, isError, error } = useCustomerPaymentsHistory();
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const list = payments ?? [];

  // Derive distinct non-null methods from loaded data
  const methods = useMemo(() => {
    const set = new Set(list.map((p) => p.payment_method).filter((m): m is string => m != null));
    return Array.from(set).sort();
  }, [list]);

  const filtered = list.filter((p) => {
    const matchesSearch = search.trim()
      ? (p.customer_master?.customer_name ?? "").toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesMethod = methodFilter === "all" || p.payment_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalAmount = list.reduce((s, p) => s + p.payment_amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments History</h1>
        <p className="text-muted-foreground text-sm mt-1">Most recent 300 customer payments, newest first.</p>
      </div>

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Payments Shown</p>
              <p className="text-2xl font-bold mt-1">{list.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold mt-1">₹{totalAmount.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Linked to Statement</p>
              <p className="text-2xl font-bold mt-1">{list.filter((p) => p.statement_id != null).length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="text-base">Payment Records</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-payments"
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-44" data-testid="select-method-filter">
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {methods.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading payments…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load payments</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Statement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.payment_id}>
                      <TableCell className="text-sm">{p.payment_date}</TableCell>
                      <TableCell className="font-medium">
                        {p.customer_master?.customer_name ?? `Customer #${p.customer_id}`}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-700">
                        ₹{p.payment_amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.payment_method ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.statement_id != null ? `STMT-${p.statement_id}` : "—"}
                      </TableCell>
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
