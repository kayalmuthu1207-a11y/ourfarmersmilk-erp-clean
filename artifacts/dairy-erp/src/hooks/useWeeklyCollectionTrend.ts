import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DailyCollectionPoint {
  date: string;
  quantity: number;
}

export function useWeeklyCollectionTrend() {
  return useQuery({
    queryKey: ["weekly-collection-trend"],
    queryFn: async (): Promise<DailyCollectionPoint[]> => {
      const start = new Date();
      start.setDate(start.getDate() - 6);
      const startDate = start.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("milk_collection_record")
        .select("collection_date, quantity")
        .gte("collection_date", startDate);
      if (error) throw new Error(error.message);

      const byDate = new Map<string, number>();
      data.forEach((r: any) => byDate.set(r.collection_date, (byDate.get(r.collection_date) ?? 0) + Number(r.quantity)));
      return Array.from(byDate.entries()).map(([date, quantity]) => ({ date, quantity })).sort((a, b) => a.date.localeCompare(b.date));
    },
  });
}
