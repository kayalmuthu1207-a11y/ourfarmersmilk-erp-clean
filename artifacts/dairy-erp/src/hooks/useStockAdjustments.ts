import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface StockAdjustment {
  adjustment_id: number;
  product_id: number;
  adjustment_qty: number;
  reason: string | null;
  adjustment_date: string;
  created_at: string;
  product_master: { product_name: string } | null;
}

export function useStockAdjustments() {
  return useQuery({
    queryKey: ["stock-adjustments"],
    queryFn: async (): Promise<StockAdjustment[]> => {
      const { data, error } = await supabase
        .from("stock_adjustment")
        .select(
          "adjustment_id, product_id, adjustment_qty, reason, adjustment_date, created_at, product_master(product_name)",
        )
        .order("adjustment_date", { ascending: false })
        .order("adjustment_id", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data as unknown as StockAdjustment[];
    },
  });
}
