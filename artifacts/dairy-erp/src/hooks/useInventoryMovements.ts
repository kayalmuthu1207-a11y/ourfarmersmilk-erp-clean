import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface InventoryMovement {
  movement_id: number;
  product_id: number;
  movement_type: string;
  quantity: number;
  movement_date: string;
  created_at: string;
  product_master: { product_name: string } | null;
}

export function useInventoryMovements() {
  return useQuery({
    queryKey: ["inventory-movements"],
    queryFn: async (): Promise<InventoryMovement[]> => {
      const { data, error } = await supabase
        .from("inventory_movement_ledger")
        .select(
          "movement_id, product_id, movement_type, quantity, movement_date, created_at, product_master(product_name)",
        )
        .order("movement_date", { ascending: false })
        .order("movement_id", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data as unknown as InventoryMovement[];
    },
  });
}
