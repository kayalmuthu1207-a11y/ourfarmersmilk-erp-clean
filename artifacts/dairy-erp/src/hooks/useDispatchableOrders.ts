import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DispatchableOrderLine {
  order_line_id: number;
  product_id: number;
  ordered_qty: number;
  vap_confirmation_status: "PENDING_CONFIRMATION" | "CONFIRMED" | "NOT_AVAILABLE" | null;
  product_master: { product_name: string } | null;
}

export interface DispatchableOrder {
  order_id: number;
  order_type: "REGULAR" | "VAP";
  order_date: string;
  is_same_day: boolean;
  customer_master: { customer_name: string } | null;
  delivery_location: { location_name: string } | null;
  customer_order_line: DispatchableOrderLine[];
}

export function useDispatchableOrders() {
  return useQuery({
    queryKey: ["dispatchable-orders"],
    queryFn: async (): Promise<DispatchableOrder[]> => {
      const { data, error } = await supabase
        .from("customer_order")
        .select(
          "order_id, order_type, order_date, is_same_day, customer_master(customer_name), delivery_location(location_name), customer_order_line(order_line_id, product_id, ordered_qty, vap_confirmation_status, product_master(product_name))",
        )
        .eq("order_status", "PLACED")
        .order("order_date");
      if (error) throw new Error(error.message);
      return data as unknown as DispatchableOrder[];
    },
  });
}
