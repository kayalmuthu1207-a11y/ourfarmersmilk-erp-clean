import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface VapQueueLine {
  order_line_id: number;
  order_id: number;
  product_id: number;
  ordered_qty: number;
  vap_confirmation_status: "PENDING_CONFIRMATION" | "CONFIRMED" | "NOT_AVAILABLE";
  product_master: { product_name: string } | null;
  customer_order: {
    order_date: string;
    customer_id: number;
    customer_master: { customer_name: string } | null;
    delivery_location: { location_name: string } | null;
  } | null;
}

export function useVapQueue() {
  return useQuery({
    queryKey: ["vap-queue"],
    queryFn: async (): Promise<VapQueueLine[]> => {
      const { data, error } = await supabase
        .from("customer_order_line")
        .select(
          "order_line_id, order_id, product_id, ordered_qty, vap_confirmation_status, product_master(product_name), customer_order(order_date, customer_id, customer_master(customer_name), delivery_location(location_name))",
        )
        .eq("vap_confirmation_status", "PENDING_CONFIRMATION")
        .order("order_id", { ascending: false });
      if (error) throw new Error(error.message);
      return data as unknown as VapQueueLine[];
    },
  });
}
