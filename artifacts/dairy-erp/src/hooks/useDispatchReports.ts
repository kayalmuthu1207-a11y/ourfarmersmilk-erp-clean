import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DispatchReportLine {
  dispatch_line_id: number;
  product_id: number;
  ordered_base_qty: number;
  dispatched_base_qty: number;
  product_master: { product_name: string } | null;
}

export interface DispatchReportRow {
  dispatch_id: number;
  order_id: number;
  dispatch_date: string;
  customer_order: { customer_master: { customer_name: string } | null } | null;
  dispatch_line: DispatchReportLine[];
}

export function useDispatchReports() {
  return useQuery({
    queryKey: ["dispatch-reports"],
    queryFn: async (): Promise<DispatchReportRow[]> => {
      const { data, error } = await supabase
        .from("dispatch_record")
        .select(
          "dispatch_id, order_id, dispatch_date, customer_order(customer_master(customer_name)), dispatch_line(dispatch_line_id, product_id, ordered_base_qty, dispatched_base_qty, product_master(product_name))",
        )
        .order("dispatch_date", { ascending: false })
        .order("dispatch_id", { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      return data as unknown as DispatchReportRow[];
    },
  });
}
