import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DeliveryLocationRow {
  location_id: number;
  customer_id: number;
  location_name: string;
  fulfillment_type: string | null;
  route_id: number | null;
  is_default_location: boolean;
  status: "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE";
  address: string | null;
  contact_person: string | null;
  phone_number: string | null;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  customer_master: { customer_name: string } | null;
  delivery_route: { route_name: string } | null;
}

export function useAllDeliveryLocations() {
  return useQuery({
    queryKey: ["all-delivery-locations"],
    queryFn: async (): Promise<DeliveryLocationRow[]> => {
      const { data, error } = await supabase
        .from("delivery_location")
        .select(
          "location_id, customer_id, location_name, fulfillment_type, route_id, is_default_location, status, address, contact_person, phone_number, approved_by, approved_at, created_at, customer_master(customer_name), delivery_route(route_name)",
        )
        .order("location_id", { ascending: false });
      if (error) throw new Error(error.message);
      return data as unknown as DeliveryLocationRow[];
    },
  });
}
