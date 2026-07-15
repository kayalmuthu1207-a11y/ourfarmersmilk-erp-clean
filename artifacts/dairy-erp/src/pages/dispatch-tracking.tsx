import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Info, CheckCircle2, Truck } from "lucide-react";
import { useTodayDispatchTracking } from "@/hooks/useTodayDispatchTracking";

export default function DispatchTracking() {
  const { data: routes, isLoading, isError, error } = useTodayDispatchTracking();
  const list = routes ?? [];
  const today = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  const fullyDispatchedRoutes = list.filter((r) => r.total_dispatched >= r.total_ordered && r.total_ordered > 0).length;
  const totalStops = list.reduce((s, r) => s + r.stops.length, 0);
  const shortStops = list.reduce((s, r) => s + r.stops.filter((st) => st.dispatched_qty < st.ordered_qty).length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dispatch Tracking</h1>
        <p className="text-muted-foreground text-sm mt-1">Today's dispatches by route — {today}</p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-900">
          There's no live per-stop delivery confirmation, driver, or vehicle tracking in the schema yet — "status"
          below is derived honestly from dispatched vs. ordered quantity on each dispatch record, not a real-time
          GPS/delivery feed.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading today's dispatches…</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Failed to load dispatch tracking</p>
          <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Routes Today</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{list.length}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fully Dispatched Routes</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{fullyDispatchedRoutes}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Stops</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalStops}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Short-Dispatched Stops</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-600">{shortStops}</p></CardContent></Card>
          </div>

          {list.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-muted-foreground text-sm">No dispatches recorded for today yet.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {list.map((route) => {
                const complete = route.total_dispatched >= route.total_ordered && route.total_ordered > 0;
                return (
                  <Card key={route.route_id ?? "unassigned"} className={complete ? "border-green-200" : "border-blue-200"}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                            {route.route_name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">{route.stops.length} stop{route.stops.length === 1 ? "" : "s"}</p>
                        </div>
                        <Badge className={complete ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"}>
                          {route.total_dispatched.toLocaleString()} / {route.total_ordered.toLocaleString()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {route.stops.map((stop) => {
                        const short = stop.dispatched_qty < stop.ordered_qty;
                        return (
                          <div key={stop.dispatch_id} className="flex items-center gap-3 text-sm">
                            {short ? (
                              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{stop.customer_name}</p>
                              {stop.location_name && <p className="text-xs text-muted-foreground">{stop.location_name}</p>}
                            </div>
                            <span className={`text-xs font-mono ${short ? "text-amber-700" : "text-muted-foreground"}`}>
                              {stop.dispatched_qty.toLocaleString()} / {stop.ordered_qty.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
