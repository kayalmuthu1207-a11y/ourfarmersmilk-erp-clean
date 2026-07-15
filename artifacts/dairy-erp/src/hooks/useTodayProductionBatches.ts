import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useTodayProductionBatches() {
  return useQuery({
    queryKey: ["today-production-batches"],
    queryFn: async (): Promise<number> => {
      const today = new Date().toISOString().slice(0, 10);
      const { count, error } = await supabase
        .from("production_batch")
        .select("*", { count: "exact", head: true })
        .eq("production_date", today);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });
}
