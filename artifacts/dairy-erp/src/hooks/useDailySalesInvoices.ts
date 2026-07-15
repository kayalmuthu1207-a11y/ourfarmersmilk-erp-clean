import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DailySalesInvoice {
  invoice_id: number;
  dispatch_id: number;
  customer_id: number;
  statement_line_id: number | null;
  invoice_amount: number;
  invoice_date: string;
  created_at: string;
  customer_master: { customer_name: string } | null;
}

export function useDailySalesInvoices() {
  return useQuery({
    queryKey: ["daily-sales-invoices"],
    queryFn: async (): Promise<DailySalesInvoice[]> => {
      const { data, error } = await supabase
        .from("daily_sales_invoice")
        .select(
          "invoice_id, dispatch_id, customer_id, statement_line_id, invoice_amount, invoice_date, created_at, customer_master(customer_name)",
        )
        .order("invoice_date", { ascending: false })
        .order("invoice_id", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data as unknown as DailySalesInvoice[];
    },
  });
}
