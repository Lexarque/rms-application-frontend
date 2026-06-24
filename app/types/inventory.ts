export type InventoryStatus = "AVAILABLE" | "LOW" | "OUT";
export type StatusFilter = "ALL" | InventoryStatus;
export type InventoryTab = "catalog" | "movement";
export type MovementType = "IN" | "OUT" | "ADJUST";
export type InventoryUnit =
  | "KG"
  | "GRAM"
  | "LITRE"
  | "MILLILITRE"
  | "BOX"
  | "CARTON"
  | "PACK"
  | "PIECE"
  | "BOTTLE"
  | "CAN"
  | "BAG"
  | "UNIT";

export const INVENTORY_UNIT_OPTIONS: InventoryUnit[] = [
  "KG",
  "GRAM",
  "LITRE",
  "MILLILITRE",
  "BOX",
  "CARTON",
  "PACK",
  "PIECE",
  "BOTTLE",
  "CAN",
  "BAG",
  "UNIT",
];

export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  unit: string;
  quantity: number;
  minimum_threshold: number;
  last_updated: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  movement_type: MovementType;
  quantity: number;
  reference: string;
  note: string;
  performed_by: string;
  created_at: string;
}

export interface InventoryMovementApi {
  id: string;
  itemId?: string;
  item_id?: string;
  itemName?: string;
  item_name?: string;
  movementType?: MovementType;
  movement_type?: MovementType;
  quantity: number;
  reference?: string;
  note?: string;
  performedBy?: string;
  performed_by?: string;
  createdAt?: string;
  created_at?: string;
}

export interface DraftItem {
  item_name: string;
  category: string;
  unit: string;
  quantity: number | "";
  minimum_threshold: number | "";
}

export interface InventoryItemApi {
  id: string;
  itemName: string;
  quantity: number;
  minimumThreshold: number;
  unit: InventoryUnit;
  lastUpdated: string;
}

export interface CreateInventoryPayload {
  itemName: string;
  quantity: number;
  minimumThreshold: number;
  unit: InventoryUnit;
}

export interface UpdateInventoryPayload {
  itemName: string;
  quantity: number;
  minimumThreshold: number;
  unit: InventoryUnit;
}

export interface AdjustInventoryQuantityPayload {
  movementType: MovementType;
  quantity: number;
  reference?: string;
  note?: string;
  performedBy?: string;
}
