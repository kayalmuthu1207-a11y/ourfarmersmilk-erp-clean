import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Employee {
  user_id: number;
  full_name: string;
  phone_number: string;
  status: "ACTIVE" | "INACTIVE";
}

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async (): Promise<Employee[]> => {
      const { data, error } = await supabase
        .from("users")
        .select("user_id, full_name, phone_number, status")
        .eq("status", "ACTIVE")
        .order("full_name");
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
