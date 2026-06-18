import { useEffect, useMemo, useState } from "react";
import {
  adjustInventoryQuantity,
  createInventoryItem,
  deleteInventoryItem,
  fetchInventoryItems,
  fetchInventoryMovements,
  updateInventoryItem,
} from "../../queries/inventory/inventoryApi";
import type {
  DraftItem,
  InventoryItem,
  InventoryMovement,
  MovementType,
  StatusFilter,
} from "../../types/inventory";
import { ITEM_TEMPLATE, currentMonth, errorText, isValidMovementType, nowStamp, statusOf } from "./utils";

export type MovementDraftLine = {
  id: string;
  itemId: string;
  itemName: string;
  unit: string;
  movementType: MovementType;
  quantity: number;
  note: string;
};

export function useInventoryModule() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState(currentMonth());

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draftMode, setDraftMode] = useState<"add" | "edit">("add");
  const [draftItem, setDraftItem] = useState<DraftItem>(ITEM_TEMPLATE);
  const [adjustQty, setAdjustQty] = useState<number | "">(0);
  const [adjustType, setAdjustType] = useState<MovementType>("IN");
  const [adjustNote, setAdjustNote] = useState("");
  const [movementItemQuery, setMovementItemQuery] = useState("");
  const [movementLines, setMovementLines] = useState<MovementDraftLine[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const metrics = useMemo(() => {
    const available = items.filter((item) => statusOf(item) === "AVAILABLE").length;
    const low = items.filter((item) => statusOf(item) === "LOW").length;
    const out = items.filter((item) => statusOf(item) === "OUT").length;
    const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    return { available, low, out, totalQty };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const s = statusOf(item);
      const statusMatched = statusFilter === "ALL" || s === statusFilter;
      const queryMatched =
        !q ||
        [item.item_name, item.category].some((value) => value.toLowerCase().includes(q));
      return statusMatched && queryMatched;
    });
  }, [items, query, statusFilter]);

  const monthMovements = useMemo(
    () => movements.filter((m) => m.created_at.startsWith(monthFilter)),
    [monthFilter, movements]
  );

  const selectedMovements = useMemo(
    () => (selectedItem ? monthMovements.filter((m) => m.item_id === selectedItem.id) : []),
    [monthMovements, selectedItem]
  );

  const outItems = useMemo(() => items.filter((item) => statusOf(item) === "OUT"), [items]);
  const movementItemOptions = useMemo(() => {
    const q = movementItemQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.item_name.toLowerCase().includes(q));
  }, [items, movementItemQuery]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const mapped = await fetchInventoryItems();
        setItems(mapped);
        setSelectedId(mapped[0]?.id ?? "");
      } catch {
        setErrorMessage("Failed to load inventory data.");
      }
    };

    void loadItems();
  }, []);

  useEffect(() => {
    const loadMovements = async () => {
      try {
        const logs = await fetchInventoryMovements(monthFilter);
        setMovements(logs);
      } catch {
        setErrorMessage("Failed to load inventory movements.");
      }
    };

    void loadMovements();
  }, [monthFilter]);

  const openAdd = () => {
    setDraftMode("add");
    setDraftItem(ITEM_TEMPLATE);
  };

  const openEdit = () => {
    if (!selectedItem) return false;
    setDraftMode("edit");
    setDraftItem({
      item_name: selectedItem.item_name,
      category: selectedItem.category,
      unit: selectedItem.unit,
      quantity: selectedItem.quantity,
      minimum_threshold: selectedItem.minimum_threshold,
    });
  };

  const openEditItem = (itemId: string) => {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return false;
    setSelectedId(item.id);
    setDraftMode("edit");
    setDraftItem({
      item_name: item.item_name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      minimum_threshold: item.minimum_threshold,
    });
    return true;
  };

  const saveDraft = async (): Promise<boolean> => {
    if (!draftItem.item_name.trim()) return false;
    setErrorMessage("");
    const quantity = draftItem.quantity === "" ? 0 : draftItem.quantity;
    const minimumThreshold =
      draftItem.minimum_threshold === "" ? 0 : draftItem.minimum_threshold;

    if (draftMode === "add") {
      try {
        const created = await createInventoryItem({
          itemName: draftItem.item_name,
          quantity,
          minimumThreshold,
        });
        setItems((prev) => [created, ...prev]);
        setSelectedId(created.id);
        setDraftMode("edit");
      } catch {
        setErrorMessage("Failed to create inventory item.");
        return false;
      }
      return true;
    }

    if (!selectedItem) return false;
    try {
      await updateInventoryItem(selectedItem.id, {
        itemName: draftItem.item_name,
        quantity,
        minimumThreshold,
      });
    } catch {
      setErrorMessage("Failed to update inventory item.");
      return false;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              ...draftItem,
              quantity,
              minimum_threshold: minimumThreshold,
              last_updated: nowStamp(),
            }
          : item
      )
    );
    return true;
  };

  const deleteSelected = async () => {
    if (!selectedItem) return;
    setErrorMessage("");

    try {
      await deleteInventoryItem(selectedItem.id);
    } catch {
      setErrorMessage("Failed to delete inventory item.");
      return;
    }

    const remaining = items.filter((item) => item.id !== selectedItem.id);
    setItems(remaining);
    setSelectedId(remaining[0]?.id ?? "");
  };

  const deleteInventoryById = async (itemId: string) => {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return false;
    setSelectedId(item.id);
    setErrorMessage("");

    try {
      await deleteInventoryItem(item.id);
    } catch {
      setErrorMessage("Failed to delete inventory item.");
      return false;
    }

    const remaining = items.filter((entry) => entry.id !== item.id);
    setItems(remaining);
    setSelectedId(remaining[0]?.id ?? "");
    return true;
  };

  const addMovementLine = () => {
    if (!selectedItem?.id) {
      setErrorMessage("Invalid inventory item selected.");
      return false;
    }
    if (!isValidMovementType(adjustType)) {
      setErrorMessage("Invalid movement type. Use IN or OUT.");
      return false;
    }
    const qty = Number(adjustQty);
    if (!Number.isFinite(qty) || qty < 1) {
      setErrorMessage("Quantity must be at least 1.");
      return false;
    }

    setErrorMessage("");
    setMovementLines((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        itemId: selectedItem.id,
        itemName: selectedItem.item_name,
        unit: selectedItem.unit,
        movementType: adjustType,
        quantity: qty,
        note: adjustNote.trim() || "Manual stock update",
      },
    ]);
    setAdjustQty(0);
    setAdjustNote("");
    return true;
  };

  const removeMovementLine = (lineId: string) => {
    setMovementLines((prev) => prev.filter((line) => line.id !== lineId));
  };

  const clearMovementLines = () => {
    setMovementLines([]);
  };

  const submitMovementLines = async () => {
    if (movementLines.length === 0) {
      setErrorMessage("Add at least one movement line before submitting.");
      return;
    }

    const projectedQty = new Map(items.map((item) => [item.id, item.quantity]));
    for (const line of movementLines) {
      const currentQty = projectedQty.get(line.itemId);
      if (currentQty == null) {
        setErrorMessage(`Item not found for line: ${line.itemName}`);
        return;
      }
      if (line.movementType === "OUT") {
        const nextQty = currentQty - line.quantity;
        if (nextQty < 0) {
          setErrorMessage(`OUT movement would cause negative stock for ${line.itemName}.`);
          return;
        }
        projectedQty.set(line.itemId, nextQty);
      }
      if (line.movementType === "IN") {
        projectedQty.set(line.itemId, currentQty + line.quantity);
      }
      if (line.movementType === "ADJUST") {
        projectedQty.set(line.itemId, line.quantity);
      }
    }

    setErrorMessage("");
    try {
      await Promise.all(
        movementLines.map((line) =>
          adjustInventoryQuantity(line.itemId, {
            movementType: line.movementType,
            quantity: line.quantity,
            reference: "MANUAL",
            note: line.note,
            performedBy: "Manager",
          })
        )
      );
      setMovementLines([]);
    } catch (error) {
      setErrorMessage(errorText(error, "Failed to submit movement batch."));
      return;
    }

    try {
      const [updatedItems, updatedMovements] = await Promise.all([
        fetchInventoryItems(),
        fetchInventoryMovements(monthFilter),
      ]);
      setItems(updatedItems);
      setMovements(updatedMovements);
    } catch (error) {
      setErrorMessage(errorText(error, "Movement batch submitted, but failed to refresh inventory history."));
    }
  };

  return {
    statusFilter,
    setStatusFilter,
    query,
    setQuery,
    monthFilter,
    setMonthFilter,
    items,
    movements,
    selectedId,
    setSelectedId,
    draftMode,
    draftItem,
    setDraftItem,
    adjustQty,
    setAdjustQty,
    adjustType,
    setAdjustType,
    adjustNote,
    setAdjustNote,
    movementItemQuery,
    setMovementItemQuery,
    movementLines,
    errorMessage,
    selectedItem,
    metrics,
    filteredItems,
    monthMovements,
    selectedMovements,
    outItems,
    movementItemOptions,
    openAdd,
    openEdit,
    openEditItem,
    saveDraft,
    deleteSelected,
    deleteInventoryById,
    addMovementLine,
    removeMovementLine,
    clearMovementLines,
    submitMovementLines,
  };
}
