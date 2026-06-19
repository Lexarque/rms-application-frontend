import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";

export interface InventoryItemDto {
  id: string;
  itemName: string;
  quantity: number;
  minimumThreshold: number;
}

export function useInventoryItems() {
  return useQuery({
    queryKey: ["inventory-items"],
    queryFn: async (): Promise<InventoryItemDto[]> => {
      const { data } = await api.get<InventoryItemDto[]>("/inventory");
      return data;
    },
  });
}