import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type {
  CreateOrderRequest,
  OrderDto,
  StatusChangeRequest,
  UpdateOrderRequest,
} from "../types/order";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateOrderRequest) => {
      const { data } = await api.post<OrderDto>("/orders", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateOrderRequest) => {
      const { data } = await api.put<OrderDto>(`/orders/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/orders/${id}`);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });
}

export function useChangeOrderStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StatusChangeRequest) => {
      const { data } = await api.post<OrderDto>(`/orders/${id}/status`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });
}