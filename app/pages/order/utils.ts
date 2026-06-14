import { C } from "~/theme/tokens";
import type { OrderStatus } from "~/types/order";

export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  DRAFT: C.muted,
  PENDING: C.warning,
  CONFIRMED: C.info,
  PREPARING: C.accent,
  READY: C.success,
  SERVED: C.info,
  COMPLETED: C.success,
  CANCELLED: C.danger,
};

export function getStatusColor(status: OrderStatus): string {
  return STATUS_COLORS[status] ?? C.muted;
}

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ["PENDING", "CANCELLED"],
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["SERVED"],
  SERVED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function getNextStatuses(status: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_FLOW[status] ?? [];
}

export function calculateItemsTotal(
  items: { priceAtOrder: number; quantity: number }[]
): number {
  return items.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
}