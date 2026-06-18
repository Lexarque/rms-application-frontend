import type { BadgeColor } from "~/components/ui/Badge";
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

const STATUS_COLORS: Record<OrderStatus, BadgeColor> = {
  DRAFT: "default",
  PENDING: "warning",
  CONFIRMED: "info",
  PREPARING: "gold",
  READY: "success",
  SERVED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export function getStatusColor(status: OrderStatus): BadgeColor {
  return STATUS_COLORS[status] ?? "default";
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
