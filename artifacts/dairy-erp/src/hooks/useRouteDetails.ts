import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface RouteLocationDetail {
  location_id: number;
  location_name: string;
  address: string | null;
  customer_id: number;
  customer_name: string;
}

export interface RouteDetail {
  route_id: number;
  route_name: string;
  locations: RouteLocationDetail[];
  todays_order_quantity: number;
}

export function useRouteDetails() {
  return useQuery({
    queryKey: ["route-details"],
    queryFn: async (): Promise<RouteDetail[]> => {
      const { data: routes, error: routesError } = await supabase
        .from("delivery_route")
        .select("route_id, route_name")
        .order("route_name");
      if (routesError) throw new Error(routesError.message);

      const { data: locations, error: locError } = await supabase
        .from("delivery_location")
        .select("location_id, location_name, address, route_id, customer_id, customer_master(customer_name)")
        .not("route_id", "is", null);
      if (locError) throw new Error(locError.message);

      const today = new Date().toISOString().slice(0, 10);
      const customerIds = Array.from(new Set(locations.map((l: any) => l.customer_id)));

      const { data: orders, error: ordersError } = await supabase
        .from("customer_order")
        .select("customer_id, customer_order_line(ordered_qty)")
        .in("customer_id", customerIds.length ? customerIds : [-1])
        .eq("order_date", today);
      if (ordersError) throw new Error(ordersError.message);

      const qtyByCustomer = new Map<number, number>();
      orders.forEach((o: any) => {
        const sum = (o.customer_order_line ?? []).reduce((s: number, l: any) => s + Number(l.ordered_qty), 0);
        qtyByCustomer.set(o.customer_id, (qtyByCustomer.get(o.customer_id) ?? 0) + sum);
      });

      return routes.map((r) => {
        const routeLocations = locations
          .filter((l: any) => l.route_id === r.route_id)
          .map((l: any) => ({
            location_id: l.location_id,
            location_name: l.location_name,
            address: l.address,
            customer_id: l.customer_id,
            customer_name: l.customer_master?.customer_name ?? "Unknown",
          }));
        const totalQty = routeLocations.reduce((s, l) => s + (qtyByCustomer.get(l.customer_id) ?? 0), 0);
        return {
          route_id: r.route_id,
          route_name: r.route_name,
          locations: routeLocations,
          todays_order_quantity: totalQty,
        };
      });
    },
  });
}
