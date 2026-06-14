import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { OrderDto } from "../types/order";

const fetchOrder = async (id: string): Promise<OrderDto> => {
  const { data } = await api.get<OrderDto>(`/orders/${id}`);
  return data;
};

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => fetchOrder(id as string),
    enabled: !!id,
  });
}