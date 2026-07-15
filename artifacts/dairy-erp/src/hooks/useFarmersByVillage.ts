import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Farmer {
  farmer_id: number;
  farmer_name: string;
  village_id: number;
}

export function useFarmersByVillage(villageId: number | undefined) {
  return useQuery({
    queryKey: ["farmers", villageId],
    enabled: villageId !== undefined,
    queryFn: async (): Promise<Farmer[]> => {
      const { data, error } = await supabase
        .from("farmer_master")
        .select("farmer_id, farmer_name, village_id")
        .eq("village_id", villageId!)
        .order("farmer_name");
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
