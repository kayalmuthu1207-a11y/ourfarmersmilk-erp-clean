import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Uom {
  uom_id: number;
  uom_code: string;
  uom_name: string;
}

export function useUomMaster() {
  return useQuery({
    queryKey: ["uom-master"],
    queryFn: async (): Promise<Uom[]> => {
      const { data, error } = await supabase
        .from("uom_master")
        .select("uom_id, uom_code, uom_name")
        .order("uom_name");
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
