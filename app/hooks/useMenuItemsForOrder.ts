import { useQuery } from "@tanstack/react-query";
import { fetchMenuItems } from "../queries/menu/menuApi";

export function useMenuItemsForOrder() {
  return useQuery({
    queryKey: ["menu-items", "available"],
    queryFn: () => fetchMenuItems({ isAvailable: true, size: 200 }),
  });
}