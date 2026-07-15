import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useInventoryBalances() {
  return useQuery({
    queryKey: ["inventory-balances"],
    queryFn: async (): Promise<Map<number, number>> => {
      const { data, error } = await supabase
        .from("inventory_balance")
        .select("product_id, current_quantity");
      if (error) throw new Error(error.message);
      return new Map(data.map((r) => [r.product_id, Number(r.current_quantity)]));
    },
  });
}
