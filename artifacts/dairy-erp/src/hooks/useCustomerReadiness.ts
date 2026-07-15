import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ReadinessSets {
  hasUser: Set<number>;
  hasLocation: Set<number>;
  hasProduct: Set<number>;
  hasPrice: Set<number>;
}

export function useCustomerReadiness() {
  return useQuery({
    queryKey: ["customer-readiness"],
    queryFn: async (): Promise<ReadinessSets> => {
      const [users, locations, mappings, prices] = await Promise.all([
        supabase.from("customer_user").select("customer_id").eq("status", "ACTIVE"),
        supabase.from("delivery_location").select("customer_id").eq("status", "ACTIVE"),
        supabase.from("customer_product_mapping").select("customer_id").eq("is_active", true),
        supabase.from("customer_price_master").select("customer_id").is("effective_to", null),
      ]);

      for (const r of [users, locations, mappings, prices]) {
        if (r.error) throw new Error(r.error.message);
      }

      return {
        hasUser: new Set(users.data!.map((r) => r.customer_id)),
        hasLocation: new Set(locations.data!.map((r) => r.customer_id)),
        hasProduct: new Set(mappings.data!.map((r) => r.customer_id)),
        hasPrice: new Set(prices.data!.map((r) => r.customer_id)),
      };
    },
  });
}
