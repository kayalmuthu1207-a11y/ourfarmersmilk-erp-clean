import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DeliveryLocation {
  location_id: number;
  location_name: string;
  address: string | null;
  status: "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE";
}

export function useCustomerDeliveryLocations(customerId: number | undefined) {
  return useQuery({
    queryKey: ["customer-delivery-locations", customerId],
    enabled: customerId !== undefined,
    queryFn: async (): Promise<DeliveryLocation[]> => {
      const { data, error } = await supabase
        .from("delivery_location")
        .select("location_id, location_name, address, status")
        .eq("customer_id", customerId!)
        .eq("status", "ACTIVE")
        .order("location_name");
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
