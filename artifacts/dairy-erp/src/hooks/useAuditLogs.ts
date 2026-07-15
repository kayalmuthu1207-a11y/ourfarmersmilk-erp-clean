import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface AuditLogEntry {
  audit_id: number;
  table_name: string;
  record_id: number;
  changed_by: number | null;
  change_summary: string | null;
  changed_at: string;
  users: { full_name: string } | null;
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("audit_id, table_name, record_id, changed_by, change_summary, changed_at, users(full_name)")
        .order("changed_at", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data as unknown as AuditLogEntry[];
    },
  });
}
