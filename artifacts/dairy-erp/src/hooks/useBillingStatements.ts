import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface BillingStatementLine {
  statement_line_id: number;
  line_amount: number;
  line_description: string | null;
}

export interface BillingStatement {
  statement_id: number;
  customer_id: number;
  cycle_start_date: string;
  cycle_end_date: string;
  total_amount: number | null;
  status: "DRAFT" | "APPROVED";
  customer_master: { customer_name: string } | null;
  billing_statement_line: BillingStatementLine[];
}

export function useBillingStatements() {
  return useQuery({
    queryKey: ["billing-statements"],
    queryFn: async (): Promise<BillingStatement[]> => {
      const { data, error } = await supabase
        .from("billing_cycle_statement")
        .select(
          "statement_id, customer_id, cycle_start_date, cycle_end_date, total_amount, status, customer_master(customer_name), billing_statement_line(statement_line_id, line_amount, line_description)",
        )
        .order("statement_id", { ascending: false });
      if (error) throw new Error(error.message);
      return data as unknown as BillingStatement[];
    },
  });
}
