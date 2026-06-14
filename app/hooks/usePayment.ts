import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { PaymentDto, ProcessPaymentRequest } from "../types/payment";

export function useProcessPayment(orderId: string) {
  return useMutation({
    mutationFn: async (payload: ProcessPaymentRequest): Promise<PaymentDto> => {
      const { data } = await api.post<PaymentDto>(
        `/payments/order/${orderId}`,
        payload
      );
      return data;
    },
  });
}