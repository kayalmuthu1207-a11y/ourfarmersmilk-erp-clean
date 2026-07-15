import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DispatchLineForAdjustment {
  dispatch_line_id: number;
  product_id: number;
  ordered_base_qty: number;
  dispatched_base_qty: number;
  product_master: { product_name: string } | null;
  dispatch_record: {
    dispatch_date: string;
    customer_order: { customer_master: { customer_name: string } | null } | null;
  } | null;
}

export function useRecentDispatchLines() {
  return useQuery({
    queryKey: ["recent-dispatch-lines"],
    queryFn: async (): Promise<DispatchLineForAdjustment[]> => {
      const { data, error } = await supabase
        .from("dispatch_line")
        .select(
          "dispatch_line_id, product_id, ordered_base_qty, dispatched_base_qty, product_master(product_name), dispatch_record(dispatch_date, customer_order(customer_master(customer_name)))",
        )
        .order("dispatch_line_id", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return data as unknown as DispatchLineForAdjustment[];
    },
  });
}
