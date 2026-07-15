import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface RecentPayment {
  payment_id: number;
  payment_amount: number;
  payment_date: string;
  payment_method: string | null;
  customer_master: { customer_name: string } | null;
}

export function useRecentPayments() {
  return useQuery({
    queryKey: ["recent-payments"],
    queryFn: async (): Promise<RecentPayment[]> => {
      const { data, error } = await supabase
        .from("customer_payment")
        .select("payment_id, payment_amount, payment_date, payment_method, customer_master(customer_name)")
        .order("payment_id", { ascending: false })
        .limit(10);
      if (error) throw new Error(error.message);
      return data as unknown as RecentPayment[];
    },
  });
}
