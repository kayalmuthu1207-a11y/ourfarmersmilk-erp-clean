import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface VertexImportBatch {
  import_batch_id: number;
  imported_at: string;
  record_count: number;
  total_qty: number;
}

export function useVertexImportBatches() {
  return useQuery({
    queryKey: ["vertex-import-batches"],
    queryFn: async (): Promise<VertexImportBatch[]> => {
      const { data: batches, error: batchesError } = await supabase
        .from("vertex_import_batch")
        .select("import_batch_id, imported_at")
        .order("import_batch_id", { ascending: false })
        .limit(30);
      if (batchesError) throw new Error(batchesError.message);

      const { data: records, error: recordsError } = await supabase
        .from("milk_collection_record")
        .select("import_batch_id, quantity")
        .not("import_batch_id", "is", null);
      if (recordsError) throw new Error(recordsError.message);

      return batches.map((b) => {
        const batchRecords = records.filter((r) => r.import_batch_id === b.import_batch_id);
        return {
          import_batch_id: b.import_batch_id,
          imported_at: b.imported_at,
          record_count: batchRecords.length,
          total_qty: batchRecords.reduce((s, r) => s + Number(r.quantity), 0),
        };
      });
    },
  });
}
