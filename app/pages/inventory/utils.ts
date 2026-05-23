import { isAxiosError } from "axios";
import type {
  DraftItem,
  InventoryItem,
  InventoryStatus,
  MovementType,
} from "../../types/inventory";

export const ITEM_TEMPLATE: DraftItem = {
  item_name: "",
  category: "",
  unit: "unit",
  quantity: 0,
  minimum_threshold: 0,
};

export function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function statusOf(item: InventoryItem): InventoryStatus {
  if (item.quantity <= 0) return "OUT";
  if (item.quantity <= item.minimum_threshold) return "LOW";
  return "AVAILABLE";
}

export function badgeColor(status: InventoryStatus) {
  if (status === "OUT") return "danger" as const;
  if (status === "LOW") return "warning" as const;
  return "success" as const;
}

export function isValidMovementType(value: string): value is MovementType {
  return ["IN", "OUT", "ADJUST"].includes(value);
}

export function errorText(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as { message?: string; error?: string } | undefined;
  return data?.message ?? data?.error ?? fallback;
}
