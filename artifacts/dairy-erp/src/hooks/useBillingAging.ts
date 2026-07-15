import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface AgingCustomer {
  customer_id: number;
  customer_name: string;
  billing_mode: "CYCLE" | "PAY_ON_DELIVERY" | "DAILY";
  outstanding_balance: number;
  last_cycle_end_date: string | null;
  days_since_cycle_end: number | null;
}

export function useBillingAging() {
  return useQuery({
    queryKey: ["billing-aging"],
    queryFn: async (): Promise<AgingCustomer[]> => {
      const { data: customers, error: custError } = await supabase
        .from("customer_master")
        .select("customer_id, customer_name, billing_mode, last_cycle_end_date");
      if (custError) throw new Error(custError.message);

      const { data: balances, error: balError } = await supabase
        .from("customer_outstanding_balance")
        .select("customer_id, outstanding_balance");
      if (balError) throw new Error(balError.message);

      const balanceMap = new Map(balances.map((b) => [b.customer_id, Number(b.outstanding_balance)]));
      const today = new Date();

      return customers
        .map((c) => {
          const balance = balanceMap.get(c.customer_id) ?? 0;
          const daysSince = c.last_cycle_end_date
            ? Math.floor((today.getTime() - new Date(c.last_cycle_end_date).getTime()) / 86400000)
            : null;
          return {
            customer_id: c.customer_id,
            customer_name: c.customer_name,
            billing_mode: c.billing_mode,
            outstanding_balance: balance,
            last_cycle_end_date: c.last_cycle_end_date,
            days_since_cycle_end: daysSince,
          };
        })
        .filter((c) => c.outstanding_balance > 0);
    },
  });
}
