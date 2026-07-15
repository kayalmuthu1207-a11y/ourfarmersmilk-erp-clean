import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DeliveryAdjustment {
  delivery_adjustment_id: number;
  dispatch_line_id: number;
  statement_line_id: number | null;
  adjustment_type: string;
  ordered_qty: number;
  delivered_qty: number;
  adjustment_qty: number;
  amount_impact: number;
  remarks: string | null;
  approval_status: string;
  entered_by: number | null;
  entered_by_customer_user_id: number | null;
  created_at: string;
}

export function useDeliveryAdjustments() {
  return useQuery({
    queryKey: ["delivery-adjustments"],
    queryFn: async (): Promise<DeliveryAdjustment[]> => {
      const { data, error } = await supabase
        .from("delivery_adjustment")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data as unknown as DeliveryAdjustment[];
    },
  });
}
