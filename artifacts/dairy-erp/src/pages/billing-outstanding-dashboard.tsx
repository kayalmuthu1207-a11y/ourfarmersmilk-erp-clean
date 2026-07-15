import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerOutstandingBalances } from "@/hooks/useCustomerOutstandingBalances";

const billingModeBadge: Record<string, string> = {
  CYCLE: "bg-blue-50 text-blue-700 border-blue-200",
  PAY_ON_DELIVERY: "bg-purple-50 text-purple-700 border-purple-200",
  DAILY: "bg-teal-50 text-teal-700 border-teal-200",
};

export default function BillingOutstandingDashboard() {
  const { data: customers, isLoading: custLoading, isError: custError, error: custErr } = useCustomers();
  const { data: balanceMap, isLoading: balLoading, isError: balError, error: balErr } = useCustomerOutstandingBalances();

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

  const totalOutstanding = rows.reduce((s, r) => s + r.outstanding_balance, 0);
  const avgBalance = rows.length > 0 ? Math.round(totalOutstanding / rows.length) : 0;
  const top10 = rows.slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Outstanding Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Summary of all outstanding customer balances.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Failed to load data</p>
          <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Outstanding</p>
                <p className="text-3xl font-bold mt-1 text-destructive">
                  ₹{totalOutstanding.toLocaleString("en-IN")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Customers With Balance</p>
                <p className="text-3xl font-bold mt-1">{rows.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Average Balance</p>
                <p className="text-3xl font-bold mt-1">₹{avgBalance.toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Top 10 table */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Top 10 by Outstanding Balance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Billing Mode</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right w-28">Share of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top10.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                        No outstanding balances.
                      </TableCell>
                    </TableRow>
                  ) : (
                    top10.map((r, idx) => {
                      const pct = totalOutstanding > 0
                        ? ((r.outstanding_balance / totalOutstanding) * 100).toFixed(1)
                        : "0.0";
                      return (
                        <TableRow key={r.customer_id}>
                          <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{r.customer_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${billingModeBadge[r.billing_mode] ?? ""}`}>
                              {r.billing_mode}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-destructive">
                            ₹{r.outstanding_balance.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">{pct}%</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
