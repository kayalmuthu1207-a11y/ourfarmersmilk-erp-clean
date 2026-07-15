import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface PaymentMatch {
  match_id: number;
  match_status: "PROPOSED" | "CONFIRMED" | "REJECTED";
  created_at: string;
  bank_transaction: {
    transaction_id: number;
    transaction_date: string;
    amount: number;
    description: string | null;
  } | null;
  customer_payment: {
    payment_id: number;
    payment_amount: number;
    payment_date: string;
    payment_method: string | null;
    customer_id: number;
    customer_master: { customer_name: string } | null;
  } | null;
}

export function usePaymentMatches() {
  return useQuery({
    queryKey: ["payment-matches"],
    queryFn: async (): Promise<PaymentMatch[]> => {
      const { data, error } = await supabase
        .from("payment_match_log")
        .select(
          "match_id, match_status, created_at, bank_transaction(transaction_id, transaction_date, amount, description), customer_payment(payment_id, payment_amount, payment_date, payment_method, customer_id, customer_master(customer_name))",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      return data as unknown as PaymentMatch[];
    },
  });
}
