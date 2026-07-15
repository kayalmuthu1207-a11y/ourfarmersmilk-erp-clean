import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface VillageCollectionSummary {
  village_id: number;
  village_name: string;
  farmer_count: number;
  total_qty: number;
  consolidated: boolean;
}

// Real, derived data only — no shift split, no FAT/SNF, no rate. Computed
// client-side from raw rows since there's no aggregate view for this yet.
export function useVillageCollectionSummary(date: string) {
  return useQuery({
    queryKey: ["village-collection-summary", date],
    queryFn: async (): Promise<VillageCollectionSummary[]> => {
      const { data: villages, error: villagesError } = await supabase
        .from("village_master")
        .select("village_id, village_name");
      if (villagesError) throw new Error(villagesError.message);

      const { data: records, error: recordsError } = await supabase
        .from("milk_collection_record")
        .select("village_id, farmer_id, quantity")
        .eq("collection_date", date);
      if (recordsError) throw new Error(recordsError.message);

      const { data: consolidations, error: consolidationsError } = await supabase
        .from("village_procurement_consolidation")
        .select("village_id")
        .eq("procurement_date", date);
      if (consolidationsError) throw new Error(consolidationsError.message);

      const consolidatedVillageIds = new Set(consolidations.map((c) => c.village_id));

      return villages.map((v) => {
        const villageRecords = records.filter((r) => r.village_id === v.village_id);
        return {
          village_id: v.village_id,
          village_name: v.village_name,
          farmer_count: new Set(villageRecords.map((r) => r.farmer_id)).size,
          total_qty: villageRecords.reduce((s, r) => s + Number(r.quantity), 0),
          consolidated: consolidatedVillageIds.has(v.village_id),
        };
      });
    },
  });
}
