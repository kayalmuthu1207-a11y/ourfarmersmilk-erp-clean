import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface CustomerProfile {
  customer_id: number;
  customer_name: string;
  category: string | null;
  billing_mode: "CYCLE" | "PAY_ON_DELIVERY" | "DAILY";
  billing_cycle_days: number | null;
  order_cutoff_time: string | null;
  status: "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE";
  primary_contact_name: string | null;
  primary_contact_phone: string | null;
  secondary_contact_name: string | null;
  secondary_contact_phone: string | null;
  is_staff_managed: boolean;
  approved_by: number | null;
  approved_at: string | null;
  last_cycle_end_date: string | null;
}

export function useCustomerProfile(customerId: number | undefined) {
  return useQuery({
    queryKey: ["customer-profile", customerId],
    enabled: customerId !== undefined,
    queryFn: async (): Promise<CustomerProfile> => {
      const { data, error } = await supabase
        .from("customer_master")
        .select("*")
        .eq("customer_id", customerId!)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
