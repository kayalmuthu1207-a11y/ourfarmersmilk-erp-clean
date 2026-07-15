import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DispatchStop {
  dispatch_id: number;
  customer_name: string;
  location_name: string | null;
  ordered_qty: number;
  dispatched_qty: number;
}

export interface RouteDispatchSummary {
  route_id: number | null;
  route_name: string;
  stops: DispatchStop[];
  total_ordered: number;
  total_dispatched: number;
}

/**
 * Surfaces today's real dispatch_record/dispatch_line rows grouped by route
 * (via customer_order -> delivery_location -> delivery_route). There is no
 * live per-stop delivery-confirmation status or driver/vehicle assignment in
 * the schema, so "completion" here is derived honestly from dispatched_qty
 * vs ordered_qty rather than a fabricated Delivered/En Route/Pending state.
 */
export function useTodayDispatchTracking() {
  return useQuery({
    queryKey: ["today-dispatch-tracking"],
    queryFn: async (): Promise<RouteDispatchSummary[]> => {
      const today = new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("dispatch_record")
        .select(
          `dispatch_id, dispatch_date,
           dispatch_line(ordered_base_qty, dispatched_base_qty),
           customer_order(
             customer_id,
             customer_master(customer_name),
             location_id,
             delivery_location(location_name, route_id, delivery_route(route_name))
           )`,
        )
        .eq("dispatch_date", today);
      if (error) throw new Error(error.message);

      const routeMap = new Map<string, RouteDispatchSummary>();

      for (const row of (data as any[]) ?? []) {
        const location = row.customer_order?.delivery_location;
        const route = location?.delivery_route;
        const routeKey = route ? String(location.route_id) : "unassigned";
        const routeName = route?.route_name ?? "No route assigned";

        if (!routeMap.has(routeKey)) {
          routeMap.set(routeKey, {
            route_id: location?.route_id ?? null,
            route_name: routeName,
            stops: [],
            total_ordered: 0,
            total_dispatched: 0,
          });
        }

        const ordered = (row.dispatch_line ?? []).reduce(
          (s: number, l: any) => s + Number(l.ordered_base_qty ?? 0),
          0,
        );
        const dispatched = (row.dispatch_line ?? []).reduce(
          (s: number, l: any) => s + Number(l.dispatched_base_qty ?? 0),
          0,
        );

        const summary = routeMap.get(routeKey)!;
        summary.stops.push({
          dispatch_id: row.dispatch_id,
          customer_name: row.customer_order?.customer_master?.customer_name ?? "Unknown",
          location_name: location?.location_name ?? null,
          ordered_qty: ordered,
          dispatched_qty: dispatched,
        });
        summary.total_ordered += ordered;
        summary.total_dispatched += dispatched;
      }

      return Array.from(routeMap.values()).sort((a, b) => a.route_name.localeCompare(b.route_name));
    },
  });
}
