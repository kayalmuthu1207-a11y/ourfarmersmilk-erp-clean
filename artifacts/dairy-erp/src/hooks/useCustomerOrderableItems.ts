import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface OrderableItem {
  mapping_id: number;
  product_id: number;
  display_name: string | null;
  product_master: { product_name: string } | null;
  uom_master: { uom_name: string } | null;
  price: number | null;
}

// Deliberately two separate queries, not a nested embed — customer_price_master
// can have multiple historical rows per mapping (only one active at a time,
// via effective_to IS NULL), so filtering that correctly inside a PostgREST
// embed is unreliable. Two flat queries, merged client-side, is safer.
export function useCustomerOrderableItems(customerId: number | undefined) {
  return useQuery({
    queryKey: ["customer-orderable-items", customerId],
    enabled: customerId !== undefined,
    queryFn: async (): Promise<OrderableItem[]> => {
      const { data: mappings, error: mappingsError } = await supabase
        .from("customer_product_mapping")
        .select("mapping_id, product_id, display_name, product_master(product_name), uom_master(uom_name)")
        .eq("customer_id", customerId!)
        .eq("is_active", true);
      if (mappingsError) throw new Error(mappingsError.message);

      const { data: prices, error: pricesError } = await supabase
        .from("customer_price_master")
        .select("mapping_id, price")
        .eq("customer_id", customerId!)
        .is("effective_to", null);
      if (pricesError) throw new Error(pricesError.message);

      const priceByMapping = new Map(prices.map((p) => [p.mapping_id, p.price]));

      return (mappings as any[]).map((m) => ({
        mapping_id: m.mapping_id,
        product_id: m.product_id,
        display_name: m.display_name,
        product_master: m.product_master,
        uom_master: m.uom_master,
        price: priceByMapping.get(m.mapping_id) ?? null,
      }));
    },
  });
}
