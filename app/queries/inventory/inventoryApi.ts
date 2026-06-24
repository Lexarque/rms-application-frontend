import { api } from "../../lib/axios";
import { isAxiosError } from "axios";
import type {
  AdjustInventoryQuantityPayload,
  CreateInventoryPayload,
  InventoryItem,
  InventoryItemApi,
  InventoryMovement,
  InventoryMovementApi,
  UpdateInventoryPayload,
} from "../../types/inventory";

function mapInventoryItem(row: InventoryItemApi): InventoryItem {
  return {
    id: row.id,
    item_name: row.itemName,
    category: "-",
    unit: row.unit,
    quantity: row.quantity,
    minimum_threshold: row.minimumThreshold,
    last_updated: row.lastUpdated,
  };
}

export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const { data } = await api.get<InventoryItemApi[]>("/inventory");
  return data.map(mapInventoryItem);
}

export async function createInventoryItem(payload: CreateInventoryPayload): Promise<InventoryItem> {
  const { data } = await api.post<InventoryItemApi>("/inventory", payload);
  return mapInventoryItem(data);
}

export async function updateInventoryItem(id: string, payload: UpdateInventoryPayload): Promise<void> {
  await api.put(`/inventory/${id}`, payload);
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await api.delete(`/inventory/${id}`);
}

function mapInventoryMovement(row: InventoryMovementApi): InventoryMovement {
  return {
    id: row.id,
    item_id: row.itemId ?? row.item_id ?? "",
    movement_type: row.movementType ?? row.movement_type ?? "IN",
    quantity: row.quantity,
    reference: row.reference ?? "-",
    note: row.note ?? "",
    performed_by: row.performedBy ?? row.performed_by ?? "System",
    created_at: row.createdAt ?? row.created_at ?? "",
  };
}

export async function fetchInventoryMovements(month?: string): Promise<InventoryMovement[]> {
  const { data } = await api.get<InventoryMovementApi[]>("/inventory/movements", {
    params: month ? { month } : undefined,
  });
  return data.map(mapInventoryMovement);
}

export async function fetchInventoryItemMovements(id: string, month?: string): Promise<InventoryMovement[]> {
  const { data } = await api.get<InventoryMovementApi[]>(`/inventory/${id}/movements`, {
    params: month ? { month } : undefined,
  });
  return data.map(mapInventoryMovement);
}

export async function adjustInventoryQuantity(
  id: string,
  payload: AdjustInventoryQuantityPayload
): Promise<void> {
  const camelPayload = {
    movementType: payload.movementType,
    quantity: payload.quantity,
    reference: payload.reference,
    note: payload.note,
    performedBy: payload.performedBy,
  };
  const snakePayload = {
    movement_type: payload.movementType,
    quantity: payload.quantity,
    reference: payload.reference,
    note: payload.note,
    performed_by: payload.performedBy,
  };
  try {
    await api.post(`/inventory/${id}/movements`, camelPayload);
    return;
  } catch (error) {
    // Keep payload casing fallback for servers that require snake_case keys.
    if (isAxiosError(error) && [400, 422].includes(error.response?.status ?? 0)) {
      await api.post(`/inventory/${id}/movements`, snakePayload);
      return;
    }
    throw error;
  }
}
