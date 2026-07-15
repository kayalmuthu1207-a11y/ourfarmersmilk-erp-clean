import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface RoleWithPermissions {
  role_id: number;
  role_code: string;
  role_name: string;
  permissions: string[];
}

export function useRolePermissions() {
  return useQuery({
    queryKey: ["role-permissions"],
    queryFn: async (): Promise<RoleWithPermissions[]> => {
      const { data: roles, error: rolesError } = await supabase
        .from("roles")
        .select("role_id, role_code, role_name")
        .order("role_id");
      if (rolesError) throw new Error(rolesError.message);

      const { data: perms, error: permsError } = await supabase
        .from("role_permissions")
        .select("role_id, permission_code");
      if (permsError) throw new Error(permsError.message);

      return roles.map((r) => ({
        ...r,
        permissions: perms.filter((p) => p.role_id === r.role_id).map((p) => p.permission_code),
      }));
    },
  });
}
