import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface OrderChangeLogEntry {
  change_log_id: number;
  order_id: number;
  change_description: string;
  changed_at: string;
  customer_order: {
    customer_master: { customer_name: string } | null;
  } | null;
}

export function useOrderChangeHistory() {
  return useQuery({
    queryKey: ["order-change-history"],
    queryFn: async (): Promise<OrderChangeLogEntry[]> => {
      const { data, error } = await supabase
        .from("order_change_log")
        .select(
          "change_log_id, order_id, change_description, changed_at, customer_order(customer_master(customer_name))",
        )
        .order("changed_at", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data as unknown as OrderChangeLogEntry[];
    },
  });
}
