export type PaymentMethod = "CASH" | "CARD";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface PaymentDto {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  cashTendered: number | null;
  changeAmount: number | null;
}

export interface ProcessPaymentRequest {
  method: PaymentMethod;
  cashTendered?: number;
}