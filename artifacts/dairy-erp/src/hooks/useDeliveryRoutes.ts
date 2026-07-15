import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DeliveryRoute {
  route_id: number;
  route_name: string;
  location_count: number;
}

export function useDeliveryRoutes() {
  return useQuery({
    queryKey: ["delivery-routes"],
    queryFn: async (): Promise<DeliveryRoute[]> => {
      const { data: routes, error: routesError } = await supabase
        .from("delivery_route")
        .select("route_id, route_name")
        .order("route_name");
      if (routesError) throw new Error(routesError.message);

      const { data: locations, error: locError } = await supabase
        .from("delivery_location")
        .select("route_id")
        .not("route_id", "is", null);
      if (locError) throw new Error(locError.message);

      return routes.map((r) => ({
        ...r,
        location_count: locations.filter((l) => l.route_id === r.route_id).length,
      }));
    },
  });
}
