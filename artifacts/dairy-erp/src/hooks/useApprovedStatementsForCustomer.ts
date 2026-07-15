import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ApprovedStatement {
  statement_id: number;
  cycle_start_date: string;
  cycle_end_date: string;
  total_amount: number | null;
}

export function useApprovedStatementsForCustomer(customerId: number | undefined) {
  return useQuery({
    queryKey: ["approved-statements", customerId],
    enabled: customerId !== undefined,
    queryFn: async (): Promise<ApprovedStatement[]> => {
      const { data, error } = await supabase
        .from("billing_cycle_statement")
        .select("statement_id, cycle_start_date, cycle_end_date, total_amount")
        .eq("customer_id", customerId!)
        .eq("status", "APPROVED")
        .order("cycle_end_date", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
