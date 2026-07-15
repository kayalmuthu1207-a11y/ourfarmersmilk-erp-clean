import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Village {
  village_id: number;
  village_name: string;
}

export function useVillages() {
  return useQuery({
    queryKey: ["villages"],
    queryFn: async (): Promise<Village[]> => {
      const { data, error } = await supabase
        .from("village_master")
        .select("village_id, village_name")
        .order("village_name");
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
