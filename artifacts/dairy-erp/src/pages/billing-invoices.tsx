import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, AlertTriangle, Info } from "lucide-react";
import { useDailySalesInvoices } from "@/hooks/useDailySalesInvoices";

export default function BillingInvoices() {
  const { data: invoices, isLoading, isError, error } = useDailySalesInvoices();
  const [search, setSearch] = useState("");

  const list = invoices ?? [];
  const filtered = search.trim()
    ? list.filter((inv) =>
        (inv.customer_master?.customer_name ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : list;

  const totalAmount = list.reduce((s, inv) => s + inv.invoice_amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Daily Sales Invoices</h1>
        <p className="text-muted-foreground text-sm mt-1">Most recent 300 invoices, newest first.</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          Daily invoices are generated automatically at dispatch time — this is a browsing view, not an entry form.
        </span>
      </div>

      {/* Summary cards */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Invoices Shown</p>
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
              <p className="text-2xl font-bold mt-1">{list.filter((i) => i.statement_line_id != null).length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="text-base">Invoice List</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-invoices"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading invoices…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load invoices</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Dispatch ID</TableHead>
                  <TableHead>Statement Line</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((inv) => (
                    <TableRow key={inv.invoice_id}>
                      <TableCell className="text-sm">{inv.invoice_date}</TableCell>
                      <TableCell className="font-medium">
                        {inv.customer_master?.customer_name ?? `Customer #${inv.customer_id}`}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">#{inv.dispatch_id}</TableCell>
                      <TableCell>
                        {inv.statement_line_id != null ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Line #{inv.statement_line_id}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{inv.invoice_amount.toLocaleString("en-IN")}
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
