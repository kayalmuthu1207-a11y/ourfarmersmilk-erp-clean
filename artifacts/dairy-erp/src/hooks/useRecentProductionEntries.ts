import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ProductionEntry {
  batch_line_id: number;
  batch_id: number;
  product_id: number;
  produced_qty: number;
  spoilage_qty: number;
  created_at: string;
  product_master: { product_name: string } | null;
  production_batch: { production_date: string } | null;
}

export function useRecentProductionEntries() {
  return useQuery({
    queryKey: ["recent-production-entries"],
    queryFn: async (): Promise<ProductionEntry[]> => {
      const { data, error } = await supabase
        .from("production_batch_line")
        .select(
          "batch_line_id, batch_id, product_id, produced_qty, spoilage_qty, created_at, product_master(product_name), production_batch(production_date)",
        )
        .order("batch_line_id", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return data as unknown as ProductionEntry[];
    },
  });
}
