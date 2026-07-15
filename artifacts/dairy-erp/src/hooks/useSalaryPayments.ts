import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SalaryPayment {
  payment_id: number;
  user_id: number;
  amount: number;
  pay_period_month: number;
  pay_period_year: number;
  payment_date: string;
  payment_method: string | null;
  remarks: string | null;
  users: { full_name: string } | null;
}

export function useSalaryPayments() {
  return useQuery({
    queryKey: ["salary-payments"],
    queryFn: async (): Promise<SalaryPayment[]> => {
      const { data, error } = await supabase
        .from("salary_payment")
        .select(
          "payment_id, user_id, amount, pay_period_month, pay_period_year, payment_date, payment_method, remarks, users(full_name)",
        )
        .order("payment_id", { ascending: false });
      if (error) throw new Error(error.message);
      return data as unknown as SalaryPayment[];
    },
  });
}
