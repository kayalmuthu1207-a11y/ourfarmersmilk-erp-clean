import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Product {
  product_id: number;
  product_name: string;
  category_id: number;
  base_uom_id: number;
  active_status: "ACTIVE" | "INACTIVE";
  product_type: "MILK" | "VAP";
  product_category: { category_name: string } | null;
  uom_master: { uom_name: string } | null;
}

// No active_status filter here on purpose — this is now used by the admin
// product master page, which needs to see and re-activate inactive products
// too. A customer-facing product picker (later work) should filter for
// ACTIVE itself, not rely on this hook doing it.
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("product_master")
        .select(
          "product_id, product_name, category_id, base_uom_id, active_status, product_type, product_category(category_name), uom_master(uom_name)",
        )
        .order("product_name");
      if (error) throw new Error(error.message);
      return data as unknown as Product[];
    },
  });
}
