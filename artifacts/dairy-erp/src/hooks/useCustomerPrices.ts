import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface CustomerPrice {
  price_id: number;
  mapping_id: number;
  price: number;
  effective_from: string;
  effective_to: string | null;
  customer_product_mapping: {
    customer_id: number;
    product_id: number;
    uom_id: number;
    display_name: string | null;
    product_master: { product_name: string } | null;
    uom_master: { uom_name: string } | null;
  } | null;
}

// Only currently-active prices (effective_to IS NULL) — a customer's price
// history isn't shown here, just what's in effect right now.
export function useCustomerPrices() {
  return useQuery({
    queryKey: ["customer-prices"],
    queryFn: async (): Promise<CustomerPrice[]> => {
      const { data, error } = await supabase
        .from("customer_price_master")
        .select(
          "price_id, mapping_id, price, effective_from, effective_to, customer_product_mapping(customer_id, product_id, uom_id, display_name, product_master(product_name), uom_master(uom_name))",
        )
        .is("effective_to", null)
        .order("price_id");
      if (error) throw new Error(error.message);
      return data as unknown as CustomerPrice[];
    },
  });
}
