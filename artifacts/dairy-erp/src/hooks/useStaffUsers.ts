import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface StaffUser {
  user_id: number;
  role_id: number;
  full_name: string;
  phone_number: string;
  status: "ACTIVE" | "INACTIVE";
  last_login_at: string | null;
  roles: { role_name: string } | null;
}

export function useStaffUsers() {
  return useQuery({
    queryKey: ["staff-users"],
    queryFn: async (): Promise<StaffUser[]> => {
      const { data, error } = await supabase
        .from("users")
        .select("user_id, role_id, full_name, phone_number, status, last_login_at, roles(role_name)")
        .order("full_name");
      if (error) throw new Error(error.message);
      return data as unknown as StaffUser[];
    },
  });
}
