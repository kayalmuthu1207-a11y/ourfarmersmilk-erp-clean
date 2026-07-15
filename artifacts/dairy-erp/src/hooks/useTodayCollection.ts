import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useTodayCollection() {
  return useQuery({
    queryKey: ["today-collection"],
    queryFn: async (): Promise<number> => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("milk_collection_record")
        .select("quantity")
        .eq("collection_date", today);
      if (error) throw new Error(error.message);
      return data.reduce((s, r: any) => s + Number(r.quantity), 0);
    },
  });
}
