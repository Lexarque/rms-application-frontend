import React, { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { C } from "../../theme/tokens";
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
  InventoryTab,
  MovementType,
  StatusFilter,
} from "../../types/inventory";
import { AlertsTab } from "./components/AlertsTab";
import { CatalogTab } from "./components/CatalogTab";
import { MovementTab } from "./components/MovementTab";
import { InventoryStyles } from "./styles";
import {
  ITEM_TEMPLATE,
  currentMonth,
  errorText,
  isValidMovementType,
  nowStamp,
  statusOf,
} from "./utils";

export default function InventoryPage() {
  type MovementDraftLine = {
    id: string;
    itemId: string;
    itemName: string;
    unit: string;
    movementType: MovementType;
    quantity: number;
    note: string;
  };

  const [activeTab, setActiveTab] = useState<InventoryTab>(() => {
    if (typeof window === "undefined") return "catalog";
    const saved = window.localStorage.getItem("inventory.activeTab");
    return saved === "movement" ? "movement" : "catalog";
  });
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
    window.localStorage.setItem("inventory.activeTab", activeTab);
  }, [activeTab]);

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
    if (!selectedItem) return;
    setDraftMode("edit");
    setDraftItem({
      item_name: selectedItem.item_name,
      category: selectedItem.category,
      unit: selectedItem.unit,
      quantity: selectedItem.quantity,
      minimum_threshold: selectedItem.minimum_threshold,
    });
  };

  const saveDraft = async () => {
    if (!draftItem.item_name.trim()) return;
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
      }
      return;
    }

    if (!selectedItem) return;
    try {
      await updateInventoryItem(selectedItem.id, {
        itemName: draftItem.item_name,
        quantity,
        minimumThreshold,
      });
    } catch {
      setErrorMessage("Failed to update inventory item.");
      return;
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

  const addMovementLine = () => {
    if (!selectedItem?.id) {
      setErrorMessage("Invalid inventory item selected.");
      return false;
    }
    if (!isValidMovementType(adjustType)) {
      setErrorMessage("Invalid movement type. Use IN, OUT, or ADJUST.");
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

  return (
    <div>
      <SectionHeader
        title="Inventory Module"
        subtitle="Manage stock catalog, post movements, and monitor low-stock risk in one workspace"
      />

      <div className="inv-kpi-row">
        <div className="inv-kpi-card">
          <span>Total Units On Hand</span>
          <strong>{metrics.totalQty.toLocaleString()}</strong>
        </div>
        <div className="inv-kpi-card">
          <span>Available</span>
          <strong style={{ color: C.success }}>{metrics.available}</strong>
        </div>
        <div className="inv-kpi-card">
          <span>Low Stock</span>
          <strong style={{ color: C.warning }}>{metrics.low}</strong>
        </div>
        <div className="inv-kpi-card">
          <span>Out of Stock</span>
          <strong style={{ color: C.danger }}>{metrics.out}</strong>
        </div>
      </div>

      <div className="inv-tabs">
        {([
          ["catalog", "Catalog"],
          ["movement", "Stock Movement"],
        ] as [InventoryTab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "inv-tab active" : "inv-tab"}
          >
            {label}
          </button>
        ))}
      </div>

      {errorMessage && <div className="inv-error">{errorMessage}</div>}

      {activeTab === "catalog" && (
        <>
          <CatalogTab
            selectedItem={selectedItem}
            filteredItems={filteredItems}
            draftItem={draftItem}
            draftMode={draftMode}
            statusFilter={statusFilter}
            query={query}
            setStatusFilter={setStatusFilter}
            setQuery={setQuery}
            setSelectedId={setSelectedId}
            setDraftItem={setDraftItem}
            onOpenAdd={openAdd}
            onOpenEdit={openEdit}
            onDelete={deleteSelected}
            onSave={saveDraft}
          />
          <div style={{ marginTop: 14 }}>
            <AlertsTab
              outItems={outItems}
              monthMovements={monthMovements}
              items={items}
              monthFilter={monthFilter}
              setMonthFilter={setMonthFilter}
            />
          </div>
        </>
      )}

      {activeTab === "movement" && (
        <MovementTab
          items={items}
          selectedId={selectedId}
          selectedItem={selectedItem}
          movementItemQuery={movementItemQuery}
          movementItemOptions={movementItemOptions}
          adjustType={adjustType}
          adjustNote={adjustNote}
          monthFilter={monthFilter}
          selectedMovements={selectedMovements}
          setSelectedId={setSelectedId}
          setMovementItemQuery={setMovementItemQuery}
          setAdjustType={setAdjustType}
          adjustQty={adjustQty}
          setAdjustQty={setAdjustQty}
          setAdjustNote={setAdjustNote}
          movementLines={movementLines}
          setMonthFilter={setMonthFilter}
          onAddMovementLine={addMovementLine}
          onRemoveMovementLine={removeMovementLine}
          onClearMovementLines={clearMovementLines}
          onSubmitMovementLines={submitMovementLines}
        />
      )}

      <InventoryStyles />
    </div>
  );
}
