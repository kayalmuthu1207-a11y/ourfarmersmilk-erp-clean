import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DashboardAlert {
  label: string;
  count: number;
}

// Same "pending" convention as billing-shortage-adjustments.tsx: the real
// approval_status values on delivery_adjustment are not one fixed literal
// across the app, so a row counts as pending when it's neither approved nor
// rejected (rather than guessing a single "proposed" string).
const APPROVED_STATUSES = new Set(["APPROVED", "CONFIRMED", "ACCEPTED"]);
const REJECTED_STATUSES = new Set(["REJECTED", "DECLINED"]);

function isPending(status: string): boolean {
  const s = status.toUpperCase();
  return !APPROVED_STATUSES.has(s) && !REJECTED_STATUSES.has(s);
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: async (): Promise<DashboardAlert[]> => {
      const [vap, locations, adjustments] = await Promise.all([
        supabase.from("customer_order_line").select("*", { count: "exact", head: true }).eq("vap_confirmation_status", "PENDING_CONFIRMATION"),
        supabase.from("delivery_location").select("*", { count: "exact", head: true }).eq("status", "PENDING_APPROVAL"),
        supabase.from("delivery_adjustment").select("approval_status"),
      ]);
      if (vap.error) throw new Error(vap.error.message);
      if (locations.error) throw new Error(locations.error.message);
      if (adjustments.error) throw new Error(adjustments.error.message);

      const pendingAdjustments = (adjustments.data ?? []).filter((a: any) => isPending(a.approval_status)).length;

      return [
        { label: "VAP confirmations pending", count: vap.count ?? 0 },
        { label: "Delivery locations awaiting approval", count: locations.count ?? 0 },
        { label: "Delivery adjustments awaiting approval", count: pendingAdjustments },
      ].filter((a) => a.count > 0);
    },
  });
}
