import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Customer {
  customer_id: number;
  customer_name: string;
  category: string | null;
  billing_mode: "CYCLE" | "PAY_ON_DELIVERY" | "DAILY";
  billing_cycle_days: number | null;
  status: "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE";
  primary_contact_name: string | null;
  primary_contact_phone: string | null;
  is_staff_managed: boolean;
}

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async (): Promise<Customer[]> => {
      const { data, error } = await supabase
        .from("customer_master")
        .select(
          "customer_id, customer_name, category, billing_mode, billing_cycle_days, status, primary_contact_name, primary_contact_phone, is_staff_managed",
        )
        .order("customer_name");

      if (error) throw new Error(error.message);
      return data;
    },
  });
}
