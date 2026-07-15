import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface BankStatementUpload {
  upload_id: number;
  storage_path: string;
  upload_date: string;
  created_at: string;
  transaction_count: number;
}

export function useBankStatementUploads() {
  return useQuery({
    queryKey: ["bank-statement-uploads"],
    queryFn: async (): Promise<BankStatementUpload[]> => {
      const { data: uploads, error: uploadsError } = await supabase
        .from("bank_statement_upload")
        .select("upload_id, storage_path, upload_date, created_at")
        .order("upload_id", { ascending: false })
        .limit(30);
      if (uploadsError) throw new Error(uploadsError.message);

      const { data: transactions, error: txError } = await supabase
        .from("bank_transaction")
        .select("upload_id");
      if (txError) throw new Error(txError.message);

      return uploads.map((u) => ({
        ...u,
        transaction_count: transactions.filter((t) => t.upload_id === u.upload_id).length,
      }));
    },
  });
}
