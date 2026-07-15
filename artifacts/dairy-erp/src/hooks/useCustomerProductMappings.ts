import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface CustomerProductMapping {
  mapping_id: number;
  customer_id: number;
  product_id: number;
  uom_id: number;
  display_name: string | null;
  is_active: boolean;
  product_master: { product_name: string } | null;
  uom_master: { uom_name: string } | null;
}

// customerId omitted = every mapping across every customer (matches the
// existing "All Customers" filter option already in the mapping page).
export function useCustomerProductMappings(customerId?: number) {
  return useQuery({
    queryKey: ["customer-product-mappings", customerId ?? "all"],
    queryFn: async (): Promise<CustomerProductMapping[]> => {
      let query = supabase
        .from("customer_product_mapping")
        .select(
          "mapping_id, customer_id, product_id, uom_id, display_name, is_active, product_master(product_name), uom_master(uom_name)",
        )
        .order("mapping_id");
      if (customerId !== undefined) {
        query = query.eq("customer_id", customerId);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as unknown as CustomerProductMapping[];
    },
  });
}
