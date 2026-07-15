import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Milk,
  ShoppingCart,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Package,
  Loader2,
  ClipboardList,
  CreditCard,
  Truck,
} from "lucide-react";
import { useTodayCollection } from "@/hooks/useTodayCollection";
import { useWeeklyCollectionTrend } from "@/hooks/useWeeklyCollectionTrend";
import { useTodayProductionBatches } from "@/hooks/useTodayProductionBatches";
import { useDashboardAlerts } from "@/hooks/useDashboardAlerts";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { useCustomerOutstandingBalances } from "@/hooks/useCustomerOutstandingBalances";
import { useCustomerPaymentsHistory } from "@/hooks/useCustomerPaymentsHistory";
import { useDispatchReports } from "@/hooks/useDispatchReports";
import { useInventoryBalances } from "@/hooks/useInventoryBalances";
import { useProducts } from "@/hooks/useProducts";

function CardError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 text-destructive text-xs">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

function CardLoading() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Loading…</span>
    </div>
  );
}

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);

  const todayCollection = useTodayCollection();
  const weeklyTrend = useWeeklyCollectionTrend();
  const todayBatches = useTodayProductionBatches();
  const alerts = useDashboardAlerts();
  const orderHistory = useOrderHistory();
  const outstandingBalances = useCustomerOutstandingBalances();
  const paymentsHistory = useCustomerPaymentsHistory();
  const dispatchReports = useDispatchReports();
  const inventoryBalances = useInventoryBalances();
  const products = useProducts();

  const activeOrdersToday = (orderHistory.data ?? []).filter((o) => o.order_date === today).length;

  const outstandingTotal = outstandingBalances.data
    ? Array.from(outstandingBalances.data.values()).reduce((s, v) => s + v, 0)
    : 0;
  const outstandingCustomers = outstandingBalances.data
    ? Array.from(outstandingBalances.data.values()).filter((v) => v > 0).length
    : 0;

  const topInventory = (() => {
    if (!inventoryBalances.data || !products.data) return [];
    return products.data
      .map((p) => ({ name: p.product_name, stock: inventoryBalances.data!.get(p.product_id) ?? 0 }))
      .filter((r) => r.stock > 0)
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 8);
  })();

  type ActivityItem = { type: "Order" | "Payment" | "Dispatch"; timestamp: string; label: string; sub: string };

  const recentActivity: ActivityItem[] = (() => {
    const orders: ActivityItem[] = (orderHistory.data ?? []).slice(0, 5).map((o) => ({
      type: "Order",
      timestamp: o.created_at,
      label: `Order #${o.order_id} — ${o.customer_master?.customer_name ?? "Unknown customer"}`,
      sub: `${o.order_type} · ${o.order_status}`,
    }));
    const payments: ActivityItem[] = (paymentsHistory.data ?? []).slice(0, 5).map((p) => ({
      type: "Payment",
      timestamp: p.payment_date,
      label: `Payment from ${p.customer_master?.customer_name ?? "Unknown customer"}`,
      sub: `₹${Number(p.payment_amount).toLocaleString()}${p.payment_method ? ` · ${p.payment_method}` : ""}`,
    }));
    const dispatches: ActivityItem[] = (dispatchReports.data ?? []).slice(0, 5).map((d) => ({
      type: "Dispatch",
      timestamp: d.dispatch_date,
      label: `Dispatch #${d.dispatch_id} — ${d.customer_order?.customer_master?.customer_name ?? "Unknown customer"}`,
      sub: `${d.dispatch_line.length} line item${d.dispatch_line.length === 1 ? "" : "s"}`,
    }));
    return [...orders, ...payments, ...dispatches]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 10);
  })();

  const activityIcon = { Order: ShoppingCart, Payment: CreditCard, Dispatch: Truck } as const;
  const activityColor = {
    Order: "bg-amber-100 text-amber-600",
    Payment: "bg-green-100 text-green-600",
    Dispatch: "bg-blue-100 text-blue-600",
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Operations Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of today's dairy operations.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-3 py-1.5 rounded-md border shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card data-testid="card-today-collection">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Collection</CardTitle>
            <Milk className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {todayCollection.isLoading ? (
              <CardLoading />
            ) : todayCollection.isError ? (
              <CardError message={(todayCollection.error as Error).message} />
            ) : (
              <div className="text-2xl font-bold">{(todayCollection.data ?? 0).toLocaleString()} L</div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-production-batches">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Production Batches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {todayBatches.isLoading ? (
              <CardLoading />
            ) : todayBatches.isError ? (
              <CardError message={(todayBatches.error as Error).message} />
            ) : (
              <div className="text-2xl font-bold">{todayBatches.data ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Batches started today</p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-orders">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {orderHistory.isLoading ? (
              <CardLoading />
            ) : orderHistory.isError ? (
              <CardError message={(orderHistory.error as Error).message} />
            ) : (
              <div className="text-2xl font-bold">{activeOrdersToday}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Orders placed today</p>
          </CardContent>
        </Card>

        <Card data-testid="card-outstanding-ar">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding AR</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {outstandingBalances.isLoading ? (
              <CardLoading />
            ) : outstandingBalances.isError ? (
              <CardError message={(outstandingBalances.error as Error).message} />
            ) : (
              <div className="text-2xl font-bold">₹{(outstandingTotal / 100000).toFixed(2)}L</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Across {outstandingCustomers} customers</p>
          </CardContent>
        </Card>

        <Card data-testid="card-tally-sync">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tally Integration Module</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="mb-2" data-testid="badge-tally-prototype">
              Prototype Preview
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Integration-ready architecture has been completed for accounting synchronization workflows. The
              current prototype demonstrates ERP data flow and accounting processes. Live Tally connectivity,
              voucher synchronization, payment posting, and bank reconciliation are planned for a future release.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1" data-testid="card-weekly-trend">
          <CardHeader>
            <CardTitle>7-Day Collection Trend</CardTitle>
            <CardDescription>Total milk collected per day (litres)</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyTrend.isLoading ? (
              <CardLoading />
            ) : weeklyTrend.isError ? (
              <CardError message={(weeklyTrend.error as Error).message} />
            ) : !weeklyTrend.data || weeklyTrend.data.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">No collection recorded in the last 7 days</p>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrend.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Line type="monotone" dataKey="quantity" name="Quantity (L)" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1" data-testid="card-inventory">
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
            <CardDescription>Top finished goods by stock quantity</CardDescription>
          </CardHeader>
          <CardContent>
            {inventoryBalances.isLoading || products.isLoading ? (
              <CardLoading />
            ) : inventoryBalances.isError ? (
              <CardError message={(inventoryBalances.error as Error).message} />
            ) : products.isError ? (
              <CardError message={(products.error as Error).message} />
            ) : topInventory.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">No inventory on hand</p>
            ) : (
              <div className="space-y-2">
                {topInventory.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm border-b last:border-0 py-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.stock.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed and Alerts / Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2" data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {orderHistory.isLoading || paymentsHistory.isLoading || dispatchReports.isLoading ? (
              <CardLoading />
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item, i) => {
                  const Icon = activityIcon[item.type];
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${activityColor[item.type]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">{item.label}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{item.type}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="col-span-1 space-y-6">
          <Card data-testid="card-system-alerts">
            <CardHeader className="pb-3">
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.isLoading ? (
                <CardLoading />
              ) : alerts.isError ? (
                <CardError message={(alerts.error as Error).message} />
              ) : !alerts.data || alerts.data.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>No alerts — all caught up</span>
                </div>
              ) : (
                alerts.data.map((a) => (
                  <div key={a.label} className="flex items-center justify-between gap-3 p-3 bg-amber-50 text-amber-700 rounded-md text-sm border border-amber-200">
                    <span className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 shrink-0" />
                      {a.label}
                    </span>
                    <span className="font-semibold">{a.count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link
                href="/dispatch/route-planning"
                data-testid="link-quick-dispatch-planning"
                className="p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors text-center text-sm font-medium text-foreground"
              >
                Dispatch Planning
              </Link>
              <Link
                href="/production/entry"
                data-testid="link-quick-enter-batch"
                className="p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors text-center text-sm font-medium text-foreground"
              >
                Enter Batch
              </Link>
              <Link
                href="/tally/resync"
                data-testid="link-quick-retry-tally-sync"
                className="p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors text-center text-sm font-medium text-foreground"
              >
                Retry Tally Sync
              </Link>
              <Link
                href="/orders/entry"
                data-testid="link-quick-new-order"
                className="p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors text-center text-sm font-medium text-foreground"
              >
                New Order
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
