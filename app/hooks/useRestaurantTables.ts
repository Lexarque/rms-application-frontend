import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { useAuth } from "~/context/AuthContext";
import { STAFF_ROLES } from "~/types/role";

export interface RestaurantTableDto {
  id: string;
  tableNumber: string;
  capacity: number;
  isActive: boolean;
}

export function useRestaurantTables() {
  const { user } = useAuth();
  const isStaff = !!user?.role && STAFF_ROLES.includes(user.role);
  const endpoint = isStaff ? "/tables" : "/tables/available";

  return useQuery({
    queryKey: ["restaurant-tables", endpoint],
    queryFn: async () => {
      const { data } = await api.get<RestaurantTableDto[]>(endpoint);
      return data;
    },
  });
}