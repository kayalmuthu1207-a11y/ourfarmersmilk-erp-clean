import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface CustomerUser {
  customer_user_id: number;
  customer_id: number;
  phone_number: string;
  full_name: string | null;
  role: string | null;
  status: string;
  last_login_at: string | null;
  customer_master: { customer_name: string } | null;
}

export function useCustomerUsers() {
  return useQuery({
    queryKey: ["customer-users"],
    queryFn: async (): Promise<CustomerUser[]> => {
      const { data, error } = await supabase
        .from("customer_user")
        .select(
          "customer_user_id, customer_id, phone_number, full_name, role, status, last_login_at, customer_master(customer_name)",
        )
        .order("customer_user_id", { ascending: false });
      if (error) throw new Error(error.message);
      return data as unknown as CustomerUser[];
    },
  });
}
