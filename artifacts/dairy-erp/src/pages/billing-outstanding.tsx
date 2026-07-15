import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, AlertTriangle } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerOutstandingBalances } from "@/hooks/useCustomerOutstandingBalances";

const billingModeBadge: Record<string, string> = {
  CYCLE: "bg-blue-50 text-blue-700 border-blue-200",
  PAY_ON_DELIVERY: "bg-purple-50 text-purple-700 border-purple-200",
  DAILY: "bg-teal-50 text-teal-700 border-teal-200",
};

export default function BillingOutstanding() {
  const { data: customers, isLoading: custLoading, isError: custError, error: custErr } = useCustomers();
  const { data: balanceMap, isLoading: balLoading, isError: balError, error: balErr } = useCustomerOutstandingBalances();
  const [search, setSearch] = useState("");

  const isLoading = custLoading || balLoading;
  const isError = custError || balError;
  const error = custErr ?? balErr;

  const rows = (() => {
    if (!customers || !balanceMap) return [];
    return customers
      .map((c) => ({ ...c, outstanding_balance: balanceMap.get(c.customer_id) ?? 0 }))
      .filter((c) => c.outstanding_balance > 0)
      .sort((a, b) => b.outstanding_balance - a.outstanding_balance);
  })();

  const filtered = search.trim()
    ? rows.filter((r) => r.customer_name.toLowerCase().includes(search.toLowerCase()))
    : rows;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Outstanding Balances</h1>
        <p className="text-muted-foreground text-sm mt-1">All customers with an outstanding balance, sorted highest first.</p>
      </div>

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Customers With Balance</p>
              <p className="text-2xl font-bold mt-1">{rows.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-bold mt-1">
                ₹{rows.reduce((s, r) => s + r.outstanding_balance, 0).toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Highest Single Balance</p>
              <p className="text-2xl font-bold mt-1">
                {rows.length > 0 ? `₹${rows[0].outstanding_balance.toLocaleString("en-IN")}` : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="text-base">Outstanding by Customer</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-outstanding"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading balances…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load balances</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Billing Mode</TableHead>
                  <TableHead className="text-right">Outstanding Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                      No outstanding balances found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.customer_id}>
                      <TableCell className="font-medium">{r.customer_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${billingModeBadge[r.billing_mode] ?? ""}`}>
                          {r.billing_mode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-destructive">
                        ₹{r.outstanding_balance.toLocaleString("en-IN")}
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
