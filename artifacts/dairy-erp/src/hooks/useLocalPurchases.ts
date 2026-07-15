import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface LocalPurchase {
  purchase_id: number;
  vendor_id: number;
  product_id: number;
  quantity: number;
  purchase_amount: number;
  purchase_date: string;
  created_at: string;
  product_master: { product_name: string } | null;
}

export function useLocalPurchases() {
  return useQuery({
    queryKey: ["local-purchases"],
    queryFn: async (): Promise<LocalPurchase[]> => {
      const { data, error } = await supabase
        .from("local_purchase_entry")
        .select(
          "purchase_id, vendor_id, product_id, quantity, purchase_amount, purchase_date, created_at, product_master(product_name)",
        )
        .order("purchase_date", { ascending: false })
        .order("purchase_id", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data as unknown as LocalPurchase[];
    },
  });
}
