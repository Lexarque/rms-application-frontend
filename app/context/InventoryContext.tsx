import React, { createContext, useContext, useMemo, useState } from "react";

export type MovementType = "IN" | "OUT" | "ADJUST" | "WASTE";
export type AlertType = "Low" | "Out" | "Expiring";
export type ReorderStatus = "Requested" | "Received";

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentQty: number;
  minThreshold: number;
  reorderLevel: number;
  supplier: string;
  location: string;
  expiryDate: string;
  lastUpdated: string;
  archived: boolean;
}

export interface StockMovement {
  id: string;
  dateTime: string;
  itemId: string;
  itemName: string;
  type: MovementType;
  qty: number;
  reason: string;
  byUser: string;
}

export interface InventoryAlert {
  id: string;
  itemId: string;
  itemName: string;
  type: AlertType;
  message: string;
  resolved: boolean;
  createdAt: string;
}

export interface ReorderRequest {
  id: string;
  itemId: string;
  itemName: string;
  supplier: string;
  qty: number;
  status: ReorderStatus;
  requestedAt: string;
  receivedAt?: string;
  requestedBy: string;
}

interface InventoryContextType {
  items: InventoryItem[];
  movements: StockMovement[];
  alerts: InventoryAlert[];
  reorderRequests: ReorderRequest[];
  addItem: (input: {
    name: string;
    unit: string;
    currentQty: number;
    minThreshold: number;
    reorderLevel: number;
    supplier: string;
    location: string;
    expiryDate: string;
  }) => void;
  adjustStock: (input: {
    itemId: string;
    delta: number;
    reason: string;
    byUser: string;
  }) => void;
  updateItemSettings: (input: {
    itemId: string;
    minThreshold: number;
    reorderLevel: number;
    supplier: string;
    location: string;
  }) => void;
  archiveItem: (itemId: string) => void;
  restoreItem: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
  createReorderRequest: (input: { itemId: string; qty: number; requestedBy: string }) => void;
  markReorderReceived: (requestId: string, receivedBy: string) => void;
  markAlertsResolved: (alertIds: string[]) => void;
  getItemStatus: (item: InventoryItem) => "OK" | "Low Stock" | "Out of Stock";
}

const InventoryContext = createContext<InventoryContextType | null>(null);

const nowIso = () => new Date().toISOString();

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: "item-rice",
    name: "Rice (Jasmine)",
    unit: "kg",
    currentQty: 45,
    minThreshold: 10,
    reorderLevel: 18,
    supplier: "Golden Grain Supply",
    location: "Dry Storage A1",
    expiryDate: "2026-07-12",
    lastUpdated: "2026-04-17T10:30:00.000Z",
    archived: false,
  },
  {
    id: "item-chicken",
    name: "Chicken Breast",
    unit: "kg",
    currentQty: 8,
    minThreshold: 10,
    reorderLevel: 15,
    supplier: "Fresh Farm Protein",
    location: "Cold Room C2",
    expiryDate: "2026-04-20",
    lastUpdated: "2026-04-18T07:10:00.000Z",
    archived: false,
  },
  {
    id: "item-coconut",
    name: "Coconut Milk",
    unit: "litre",
    currentQty: 5,
    minThreshold: 8,
    reorderLevel: 12,
    supplier: "Kelapa Foods",
    location: "Cold Room C1",
    expiryDate: "2026-04-19",
    lastUpdated: "2026-04-18T08:45:00.000Z",
    archived: false,
  },
  {
    id: "item-oil",
    name: "Cooking Oil",
    unit: "litre",
    currentQty: 20,
    minThreshold: 5,
    reorderLevel: 8,
    supplier: "Pantry Essentials",
    location: "Dry Storage B1",
    expiryDate: "2026-08-30",
    lastUpdated: "2026-04-16T12:15:00.000Z",
    archived: false,
  },
  {
    id: "item-chilli",
    name: "Chilli Paste",
    unit: "kg",
    currentQty: 3,
    minThreshold: 5,
    reorderLevel: 7,
    supplier: "Spice Route Trading",
    location: "Cold Room C3",
    expiryDate: "2026-05-02",
    lastUpdated: "2026-04-18T09:05:00.000Z",
    archived: false,
  },
  {
    id: "item-egg",
    name: "Eggs",
    unit: "tray",
    currentQty: 0,
    minThreshold: 3,
    reorderLevel: 6,
    supplier: "Daily Poultry Hub",
    location: "Cold Room C2",
    expiryDate: "2026-04-21",
    lastUpdated: "2026-04-18T09:40:00.000Z",
    archived: false,
  },
];

const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-1001",
    dateTime: "2026-04-18T09:40:00.000Z",
    itemId: "item-egg",
    itemName: "Eggs",
    type: "OUT",
    qty: 2,
    reason: "Breakfast rush usage",
    byUser: "Kitchen",
  },
  {
    id: "mov-1002",
    dateTime: "2026-04-18T09:05:00.000Z",
    itemId: "item-chilli",
    itemName: "Chilli Paste",
    type: "OUT",
    qty: 1,
    reason: "Prep batch for lunch",
    byUser: "Kitchen",
  },
  {
    id: "mov-1003",
    dateTime: "2026-04-18T08:45:00.000Z",
    itemId: "item-coconut",
    itemName: "Coconut Milk",
    type: "OUT",
    qty: 2,
    reason: "Laksa prep",
    byUser: "Kitchen",
  },
  {
    id: "mov-1004",
    dateTime: "2026-04-18T07:10:00.000Z",
    itemId: "item-chicken",
    itemName: "Chicken Breast",
    type: "OUT",
    qty: 4,
    reason: "Order fulfillment",
    byUser: "Kitchen",
  },
  {
    id: "mov-1005",
    dateTime: "2026-04-17T15:30:00.000Z",
    itemId: "item-rice",
    itemName: "Rice (Jasmine)",
    type: "IN",
    qty: 20,
    reason: "Weekly supplier delivery",
    byUser: "Manager",
  },
];

const INITIAL_REORDER_REQUESTS: ReorderRequest[] = [
  {
    id: "REQ-3001",
    itemId: "item-egg",
    itemName: "Eggs",
    supplier: "Daily Poultry Hub",
    qty: 12,
    status: "Requested",
    requestedAt: "2026-04-18T10:00:00.000Z",
    requestedBy: "Ahmad Zulkifli",
  },
];

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS);
  const [reorderRequests, setReorderRequests] =
    useState<ReorderRequest[]>(INITIAL_REORDER_REQUESTS);
  const [resolvedAlertIds, setResolvedAlertIds] = useState<string[]>([]);

  const getItemStatus = (item: InventoryItem): "OK" | "Low Stock" | "Out of Stock" => {
    if (item.currentQty <= 0) return "Out of Stock";
    if (item.currentQty <= item.minThreshold) return "Low Stock";
    return "OK";
  };

  const activeItems = useMemo(() => items.filter((item) => !item.archived), [items]);

  const alerts = useMemo<InventoryAlert[]>(() => {
    const now = new Date();
    return activeItems
      .flatMap((item) => {
        const createdAt = item.lastUpdated;
        const status = getItemStatus(item);
        const expiringSoonDays =
          (new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        const expiringSoon = expiringSoonDays <= 7;

        const row: InventoryAlert[] = [];

        if (status === "Out of Stock") {
          row.push({
            id: `out-${item.id}`,
            itemId: item.id,
            itemName: item.name,
            type: "Out",
            message: `${item.name} is out of stock.`,
            resolved: false,
            createdAt,
          });
        }

        if (status === "Low Stock") {
          row.push({
            id: `low-${item.id}`,
            itemId: item.id,
            itemName: item.name,
            type: "Low",
            message: `${item.name} is below minimum threshold.`,
            resolved: false,
            createdAt,
          });
        }

        if (expiringSoon) {
          row.push({
            id: `exp-${item.id}`,
            itemId: item.id,
            itemName: item.name,
            type: "Expiring",
            message: `${item.name} expires on ${item.expiryDate}.`,
            resolved: false,
            createdAt,
          });
        }

        return row;
      })
      .map((alert) => ({
        ...alert,
        resolved: resolvedAlertIds.includes(alert.id),
      }));
  }, [activeItems, resolvedAlertIds]);

  const addMovement = (entry: Omit<StockMovement, "id" | "dateTime">) => {
    const movement: StockMovement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dateTime: nowIso(),
      ...entry,
    };
    setMovements((prev) => [movement, ...prev]);
  };

  const addItem = (input: {
    name: string;
    unit: string;
    currentQty: number;
    minThreshold: number;
    reorderLevel: number;
    supplier: string;
    location: string;
    expiryDate: string;
  }) => {
    const now = nowIso();
    const item: InventoryItem = {
      id: `item-${Date.now()}`,
      name: input.name.trim(),
      unit: input.unit.trim(),
      currentQty: Math.max(0, input.currentQty),
      minThreshold: Math.max(0, input.minThreshold),
      reorderLevel: Math.max(0, input.reorderLevel),
      supplier: input.supplier.trim(),
      location: input.location.trim(),
      expiryDate: input.expiryDate,
      lastUpdated: now,
      archived: false,
    };

    setItems((prev) => [item, ...prev]);
  };

  const adjustStock = (input: {
    itemId: string;
    delta: number;
    reason: string;
    byUser: string;
  }) => {
    if (!input.delta) return;
    const targetItem = items.find((item) => item.id === input.itemId && !item.archived);
    if (!targetItem) return;

    const now = nowIso();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== input.itemId || item.archived) return item;
        return {
          ...item,
          currentQty: Math.max(0, item.currentQty + input.delta),
          lastUpdated: now,
        };
      })
    );

    addMovement({
      itemId: input.itemId,
      itemName: targetItem.name,
      type: "ADJUST",
      qty: Math.abs(input.delta),
      reason: input.reason,
      byUser: input.byUser,
    });
  };

  const updateItemSettings = (input: {
    itemId: string;
    minThreshold: number;
    reorderLevel: number;
    supplier: string;
    location: string;
  }) => {
    const now = nowIso();
    setItems((prev) =>
      prev.map((item) =>
        item.id === input.itemId
          ? {
              ...item,
              minThreshold: Math.max(0, input.minThreshold),
              reorderLevel: Math.max(0, input.reorderLevel),
              supplier: input.supplier,
              location: input.location,
              lastUpdated: now,
            }
          : item
      )
    );
  };

  const archiveItem = (itemId: string) => {
    const now = nowIso();
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              archived: true,
              lastUpdated: now,
            }
          : item
      )
    );
  };

  const restoreItem = (itemId: string) => {
    const now = nowIso();
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              archived: false,
              lastUpdated: now,
            }
          : item
      )
    );
  };

  const deleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setMovements((prev) => prev.filter((move) => move.itemId !== itemId));
    setReorderRequests((prev) => prev.filter((req) => req.itemId !== itemId));
    setResolvedAlertIds((prev) => prev.filter((id) => !id.endsWith(itemId)));
  };

  const createReorderRequest = (input: { itemId: string; qty: number; requestedBy: string }) => {
    const item = items.find((x) => x.id === input.itemId);
    if (!item || item.archived || input.qty <= 0) return;

    const request: ReorderRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      itemId: item.id,
      itemName: item.name,
      supplier: item.supplier,
      qty: input.qty,
      status: "Requested",
      requestedAt: nowIso(),
      requestedBy: input.requestedBy,
    };

    setReorderRequests((prev) => [request, ...prev]);
  };

  const markReorderReceived = (requestId: string, receivedBy: string) => {
    const now = nowIso();
    const existingRequest = reorderRequests.find((req) => req.id === requestId);
    if (!existingRequest || existingRequest.status === "Received") return;

    const receivedRequest: ReorderRequest = {
      ...existingRequest,
      status: "Received",
      receivedAt: now,
    };

    setReorderRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId || req.status === "Received") return req;
        return {
          ...req,
          status: "Received",
          receivedAt: now,
        };
      })
    );

    setItems((prev) =>
      prev.map((item) =>
        item.id === receivedRequest.itemId
          ? {
              ...item,
              currentQty: item.currentQty + receivedRequest.qty,
              lastUpdated: now,
            }
          : item
      )
    );

    addMovement({
      itemId: receivedRequest.itemId,
      itemName: receivedRequest.itemName,
      type: "IN",
      qty: receivedRequest.qty,
      reason: `Reorder received (${receivedRequest.id})`,
      byUser: receivedBy,
    });
  };

  const markAlertsResolved = (alertIds: string[]) => {
    if (alertIds.length === 0) return;
    setResolvedAlertIds((prev) => Array.from(new Set([...prev, ...alertIds])));
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        movements,
        alerts,
        reorderRequests,
        addItem,
        adjustStock,
        updateItemSettings,
        archiveItem,
        restoreItem,
        deleteItem,
        createReorderRequest,
        markReorderReceived,
        markAlertsResolved,
        getItemStatus,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
}
