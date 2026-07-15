import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface CustomerPaymentRecord {
  payment_id: number;
  statement_id: number | null;
  payment_amount: number;
  payment_date: string;
  payment_method: string | null;
  customer_id: number;
  customer_master: { customer_name: string } | null;
}

export function useCustomerPaymentsHistory() {
  return useQuery({
    queryKey: ["customer-payments-history"],
    queryFn: async (): Promise<CustomerPaymentRecord[]> => {
      const { data, error } = await supabase
        .from("customer_payment")
        .select(
          "payment_id, statement_id, payment_amount, payment_date, payment_method, customer_id, customer_master(customer_name)",
        )
        .order("payment_date", { ascending: false })
        .order("payment_id", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data as unknown as CustomerPaymentRecord[];
    },
  });
}
