import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ProductionHistoryLine {
  batch_line_id: number;
  product_id: number;
  produced_qty: number;
  spoilage_qty: number;
  product_master: { product_name: string } | null;
}

export interface ProductionHistoryBatch {
  batch_id: number;
  production_date: string;
  created_at: string;
  production_batch_line: ProductionHistoryLine[];
}

export function useProductionHistory() {
  return useQuery({
    queryKey: ["production-history"],
    queryFn: async (): Promise<ProductionHistoryBatch[]> => {
      const { data, error } = await supabase
        .from("production_batch")
        .select(
          "batch_id, production_date, created_at, production_batch_line(batch_line_id, product_id, produced_qty, spoilage_qty, product_master(product_name))",
        )
        .order("production_date", { ascending: false })
        .limit(60);
      if (error) throw new Error(error.message);
      return data as unknown as ProductionHistoryBatch[];
    },
  });
}
