import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface OrderHistoryLine {
  order_line_id: number;
  product_id: number;
  ordered_qty: number;
  unit_price: number;
  line_amount: number;
  vap_confirmation_status: "PENDING_CONFIRMATION" | "CONFIRMED" | "NOT_AVAILABLE" | null;
  product_master: { product_name: string } | null;
}

export interface OrderHistoryRow {
  order_id: number;
  order_type: "REGULAR" | "VAP";
  order_date: string;
  order_status: string;
  is_same_day: boolean;
  created_at: string;
  customer_master: { customer_name: string } | null;
  delivery_location: { location_name: string } | null;
  customer_order_line: OrderHistoryLine[];
}

export function useOrderHistory() {
  return useQuery({
    queryKey: ["order-history"],
    queryFn: async (): Promise<OrderHistoryRow[]> => {
      const { data, error } = await supabase
        .from("customer_order")
        .select(
          "order_id, order_type, order_date, order_status, is_same_day, created_at, customer_master(customer_name), delivery_location(location_name), customer_order_line(order_line_id, product_id, ordered_qty, unit_price, line_amount, vap_confirmation_status, product_master(product_name))",
        )
        .order("order_date", { ascending: false })
        .order("order_id", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data as unknown as OrderHistoryRow[];
    },
  });
}
