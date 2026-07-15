import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ProductCategory {
  category_id: number;
  category_name: string;
}

export function useProductCategories() {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: async (): Promise<ProductCategory[]> => {
      const { data, error } = await supabase
        .from("product_category")
        .select("category_id, category_name")
        .order("category_name");
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
