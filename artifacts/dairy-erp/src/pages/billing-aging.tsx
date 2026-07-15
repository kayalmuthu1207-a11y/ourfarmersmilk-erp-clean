import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { useBillingAging, type AgingCustomer } from "@/hooks/useBillingAging";

type Bucket = "0-30" | "31-60" | "61-90" | "90+" | "non-cycle";

function getBucket(row: AgingCustomer): Bucket {
  if (row.days_since_cycle_end === null) return "non-cycle";
  if (row.days_since_cycle_end <= 30) return "0-30";
  if (row.days_since_cycle_end <= 60) return "31-60";
  if (row.days_since_cycle_end <= 90) return "61-90";
  return "90+";
}

const bucketMeta: Record<Bucket, { label: string; badgeClass: string; cardClass: string }> = {
  "0-30":     { label: "0–30 days",      badgeClass: "bg-green-50 text-green-700 border-green-200",  cardClass: "border-green-200" },
  "31-60":    { label: "31–60 days",     badgeClass: "bg-amber-50 text-amber-700 border-amber-200",  cardClass: "border-amber-200" },
  "61-90":    { label: "61–90 days",     badgeClass: "bg-orange-50 text-orange-700 border-orange-200", cardClass: "border-orange-200" },
  "90+":      { label: "90+ days",       badgeClass: "bg-red-50 text-red-700 border-red-200",         cardClass: "border-red-200" },
  "non-cycle":{ label: "Non-Cycle",      badgeClass: "bg-gray-100 text-gray-600 border-gray-300",     cardClass: "border-gray-200" },
};

const BUCKET_ORDER: Bucket[] = ["0-30", "31-60", "61-90", "90+", "non-cycle"];

export default function BillingAging() {
  const { data: rows, isLoading, isError, error } = useBillingAging();

  const list = rows ?? [];

  const buckets = BUCKET_ORDER.map((b) => ({
    key: b,
    meta: bucketMeta[b],
    rows: list.filter((r) => getBucket(r) === b),
    total: list.filter((r) => getBucket(r) === b).reduce((s, r) => s + r.outstanding_balance, 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Aging Report</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Outstanding balances bucketed by days since last billing cycle closed.
        </p>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          Aging is based on days since each customer's last billing cycle closed. Non-cycle customers are shown
          separately since they don't have a cycle date to age against.
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading aging data…</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Failed to load aging data</p>
          <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
        </div>
      ) : (
        <>
          {/* Bucket summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {buckets.map((b) => (
              <Card key={b.key} className={`border ${b.meta.cardClass}`}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">{b.meta.label}</p>
                  <p className="text-xl font-bold mt-1">₹{b.total.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.rows.length} customer{b.rows.length !== 1 ? "s" : ""}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full table */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">All Outstanding — by Aging Bucket</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Billing Mode</TableHead>
                    <TableHead>Last Cycle End</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Bucket</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                        No outstanding balances.
                      </TableCell>
                    </TableRow>
                  ) : (
                    BUCKET_ORDER.flatMap((b) =>
                      buckets.find((bk) => bk.key === b)!.rows.map((r) => (
                        <TableRow key={r.customer_id}>
                          <TableCell className="font-medium">{r.customer_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.billing_mode}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {r.last_cycle_end_date ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {r.days_since_cycle_end != null ? `${r.days_since_cycle_end}d` : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${bucketMeta[getBucket(r)].badgeClass}`}>
                              {bucketMeta[getBucket(r)].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-destructive">
                            ₹{r.outstanding_balance.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))
                    )
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
