import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useCustomerOutstandingBalances() {
  return useQuery({
    queryKey: ["customer-outstanding-balances"],
    queryFn: async (): Promise<Map<number, number>> => {
      const { data, error } = await supabase
        .from("customer_outstanding_balance")
        .select("customer_id, outstanding_balance");

      if (error) throw new Error(error.message);

      return new Map(data.map((row) => [row.customer_id, Number(row.outstanding_balance)]));
    },
  });
}
