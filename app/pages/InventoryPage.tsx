import React, { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/Badge";
import { Btn } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table } from "../components/ui/Table";
import {
  adjustInventoryQuantity,
  createInventoryItem,
  deleteInventoryItem,
  fetchInventoryMovements,
  fetchInventoryItemMovements,
  fetchInventoryItems,
  updateInventoryItem,
} from "../queries/inventory/inventoryApi";
import { C, font } from "../theme/tokens";
import type {
  DraftItem,
  InventoryItem,
  InventoryMovement,
  InventoryStatus,
  InventoryTab,
  MovementType,
  StatusFilter,
} from "../types/inventory";

const ITEM_TEMPLATE: DraftItem = {
  item_name: "",
  category: "",
  unit: "unit",
  quantity: 0,
  minimum_threshold: 0,
};

function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function statusOf(item: InventoryItem): InventoryStatus {
  if (item.quantity <= 0) return "OUT";
  if (item.quantity <= item.minimum_threshold) return "LOW";
  return "AVAILABLE";
}

function badgeColor(status: InventoryStatus) {
  if (status === "OUT") return "danger" as const;
  if (status === "LOW") return "warning" as const;
  return "success" as const;
}

function errorText(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as { message?: string; error?: string } | undefined;
  return data?.message ?? data?.error ?? fallback;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>(() => {
    if (typeof window === "undefined") return "catalog";
    const saved = window.localStorage.getItem("inventory.activeTab");
    return saved === "catalog" || saved === "movement" || saved === "alerts" ? saved : "catalog";
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState(currentMonth());

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draftMode, setDraftMode] = useState<"add" | "edit">("add");
  const [draftItem, setDraftItem] = useState<DraftItem>(ITEM_TEMPLATE);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<MovementType>("IN");
  const [adjustNote, setAdjustNote] = useState("");
  const [movementItemQuery, setMovementItemQuery] = useState("");
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
      } catch (error) {
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
      } catch (error) {
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

    if (draftMode === "add") {
      try {
        const created = await createInventoryItem({
          itemName: draftItem.item_name,
          quantity: draftItem.quantity,
          minimumThreshold: draftItem.minimum_threshold,
        });
        setItems((prev) => [created, ...prev]);
        setSelectedId(created.id);
        setDraftMode("edit");
      } catch (error) {
        setErrorMessage("Failed to create inventory item.");
      }
      return;
    }

    if (!selectedItem) return;
    try {
      await updateInventoryItem(selectedItem.id, {
        itemName: draftItem.item_name,
        quantity: draftItem.quantity,
        minimumThreshold: draftItem.minimum_threshold,
      });
    } catch (error) {
      setErrorMessage("Failed to update inventory item.");
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? { ...item, ...draftItem, last_updated: nowStamp() }
          : item
      )
    );
  };

  const deleteSelected = async () => {
    if (!selectedItem) return;
    setErrorMessage("");

    try {
      await deleteInventoryItem(selectedItem.id);
    } catch (error) {
      setErrorMessage("Failed to delete inventory item.");
      return;
    }

    const remaining = items.filter((item) => item.id !== selectedItem.id);
    setItems(remaining);
    setSelectedId(remaining[0]?.id ?? "");
  };

  const postAdjustment = async () => {
    if (!selectedItem?.id) {
      setErrorMessage("Invalid inventory item selected.");
      return;
    }
    if (!(["IN", "OUT", "ADJUST"] as MovementType[]).includes(adjustType)) {
      setErrorMessage("Invalid movement type. Use IN, OUT, or ADJUST.");
      return;
    }
    if (adjustQty < 1) {
      setErrorMessage("Quantity must be at least 1.");
      return;
    }
    if (adjustType === "OUT" && selectedItem.quantity - adjustQty < 0) {
      setErrorMessage("OUT movement would cause negative stock.");
      return;
    }

    setErrorMessage("");
    try {
      await adjustInventoryQuantity(selectedItem.id, {
        movementType: adjustType,
        quantity: adjustQty,
        reference: "MANUAL",
        note: adjustNote.trim() || "Manual stock update",
        performedBy: "Manager",
      });
      setAdjustQty(0);
      setAdjustNote("");
    } catch (error) {
      setErrorMessage(errorText(error, "Failed to post stock movement."));
      return;
    }

    try {
      const [updatedItems, updatedItemMovements] = await Promise.all([
        fetchInventoryItems(),
        fetchInventoryItemMovements(selectedItem.id, monthFilter),
      ]);

      setItems(updatedItems);
      setMovements((prev) => {
        const keepOtherItems = prev.filter((m) => m.item_id !== selectedItem.id);
        return [...updatedItemMovements, ...keepOtherItems];
      });
    } catch (error) {
      setErrorMessage(errorText(error, "Stock movement posted, but failed to refresh inventory history."));
    }
  };

  const tabButton = (tab: InventoryTab, label: string) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={activeTab === tab ? "inv-tab active" : "inv-tab"}
    >
      {label}
    </button>
  );

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

      <div className="inv-tabs">{[
        tabButton("catalog", "Catalog"),
        tabButton("movement", "Stock Movement"),
        tabButton("alerts", "Alerts & Audit"),
      ]}</div>
      {errorMessage && <div className="inv-error">{errorMessage}</div>}

      {activeTab === "catalog" && (
        <div className="inv-grid">
          <section className="inv-panel">
            <div className="inv-row-between">
              <h3>Item Registry</h3>
              <div className="inv-actions">
                <Btn size="sm" variant="ghost" onClick={openAdd}>New Item</Btn>
                <Btn size="sm" variant="ghost" onClick={openEdit} disabled={!selectedItem}>Edit Selected</Btn>
                <Btn size="sm" variant="danger" onClick={deleteSelected} disabled={!selectedItem}>Delete</Btn>
              </div>
            </div>

            <div className="inv-filter-grid">
              <Input
                label="Search by item / category"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Olive Oil"
              />
              <div>
                <div className="inv-label">Stock Status</div>
                <div className="inv-pills">
                  {(["ALL", "AVAILABLE", "LOW", "OUT"] as StatusFilter[]).map((value) => (
                    <button
                      key={value}
                      onClick={() => setStatusFilter(value)}
                      className={statusFilter === value ? "inv-pill active" : "inv-pill"}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="inv-table-wrap">
              <Table
                columns={["Item Name", "Qty", "Min Threshold", "Status", "Last Updated"]}
                rows={filteredItems.map((item) => [
                  <div style={{ fontWeight: 700, color: item.id === selectedItem?.id ? C.accent : C.text }}>
                    {item.item_name}
                  </div>,
                  `${item.quantity} ${item.unit}`,
                  `${item.minimum_threshold} ${item.unit}`,
                  <Badge label={statusOf(item)} color={badgeColor(statusOf(item))} />,
                  item.last_updated,
                ])}
                onRowClick={(index) => setSelectedId(filteredItems[index].id)}
                emptyMessage="No matching inventory items."
              />
            </div>
          </section>

          <section className="inv-panel">
            <h3>{draftMode === "add" ? "Add Inventory Item" : "Edit Inventory Item"}</h3>
            <div className="inv-form-grid">
              <Input
                label="Item Name"
                value={draftItem.item_name}
                onChange={(e) => setDraftItem((prev) => ({ ...prev, item_name: e.target.value }))}
              />
              <Input
                label="Unit"
                value={draftItem.unit}
                onChange={(e) => setDraftItem((prev) => ({ ...prev, unit: e.target.value }))}
              />
              <Input
                type="number"
                label="Quantity"
                value={draftItem.quantity}
                onChange={(e) =>
                  setDraftItem((prev) => ({ ...prev, quantity: Math.max(0, Number(e.target.value) || 0) }))
                }
              />
              <Input
                type="number"
                label="Minimum Threshold"
                value={draftItem.minimum_threshold}
                onChange={(e) =>
                  setDraftItem((prev) => ({
                    ...prev,
                    minimum_threshold: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
              />
            </div>

            <div className="inv-actions">
              <Btn onClick={() => void saveDraft()}>{draftMode === "add" ? "Create Item" : "Save Changes"}</Btn>
              <Btn variant="ghost" onClick={openAdd}>Clear Form</Btn>
            </div>

            {selectedItem ? (
              <div className="inv-selected-card">
                <div className="inv-row-between">
                  <strong className="inv-selected-title">{selectedItem.item_name}</strong>
                  <Badge label={statusOf(selectedItem)} color={badgeColor(statusOf(selectedItem))} />
                </div>
                <div className="inv-meta">Quantity: {selectedItem.quantity} {selectedItem.unit}</div>
                <div className="inv-meta">Threshold: {selectedItem.minimum_threshold} {selectedItem.unit}</div>
              </div>
            ) : (
              <div className="inv-selected-card">
                <div className="inv-meta">No selected item. Create one to start stock operations.</div>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "movement" && (
        <div className="inv-grid">
          <section className="inv-panel">
            <h3>Post Stock Movement</h3>
            <div className="inv-form-grid">
              <Input
                label="Search Product"
                value={movementItemQuery}
                onChange={(e) => setMovementItemQuery(e.target.value)}
                placeholder="Type product name..."
              />
              <div>
                <div className="inv-label">Product</div>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontFamily: font.body,
                    color: C.text,
                    background: "#fff",
                    outline: "none",
                    width: "100%",
                  }}
                >
                  {movementItemOptions.length === 0 && <option value="">No matching products</option>}
                  {movementItemOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="inv-label">Movement Type</div>
                <div className="inv-pills">
                  {(["IN", "OUT", "ADJUST"] as MovementType[]).map((value) => (
                    <button
                      key={value}
                      onClick={() => setAdjustType(value)}
                      className={adjustType === value ? "inv-pill active" : "inv-pill"}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label={adjustType === "ADJUST" ? `Set final quantity (${selectedItem?.unit ?? "unit"})` : `Quantity (${selectedItem?.unit ?? "unit"})`}
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(Math.max(0, Number(e.target.value) || 0))}
              />
              <Input
                label="Note"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="Reason for this movement"
              />
            </div>
            <Btn onClick={postAdjustment} disabled={adjustQty <= 0 || !selectedItem}>Post Movement</Btn>
          </section>

          <section className="inv-panel">
            <h3>Selected Item Monthly History</h3>
            <Input
              type="month"
              label="Month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
            <div className="inv-table-wrap">
              <Table
                columns={["Date", "Type", "Qty", "Reference", "By", "Note"]}
                rows={selectedMovements.map((m) => [
                  m.created_at,
                  <Badge label={m.movement_type} color={m.movement_type === "IN" ? "success" : m.movement_type === "OUT" ? "danger" : "info"} />,
                    `${m.quantity} ${selectedItem?.unit ?? "unit"}`,
                  m.reference,
                  m.performed_by,
                  m.note,
                ])}
                emptyMessage="No movement records for selected month."
              />
            </div>
          </section>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="inv-grid single">
          <section className="inv-panel">
            <h3>Risk Alerts</h3>
            {outItems.length === 0 ? (
              <div className="inv-ok">No out-of-stock items. Alert queue is clear.</div>
            ) : (
              <div className="inv-alert-list">
                {outItems.map((item) => (
                  <div key={item.id} className="inv-alert-row">
                    <div>
                      <strong>{item.item_name}</strong>
                    </div>
                    <Badge label="OUT OF STOCK" color="danger" />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="inv-panel">
            <h3>Audit Trail</h3>
            <div className="inv-table-wrap">
              <Table
                columns={["Date", "Item", "Type", "Qty", "By", "Reference"]}
                rows={monthMovements.map((m) => {
                  const item = items.find((i) => i.id === m.item_id);
                  return [
                    m.created_at,
                    item?.item_name ?? m.item_id,
                    <Badge label={m.movement_type} color={m.movement_type === "IN" ? "success" : m.movement_type === "OUT" ? "danger" : "info"} />,
                    String(m.quantity),
                    m.performed_by,
                    m.reference,
                  ];
                })}
                emptyMessage="No movement logs for selected month."
              />
            </div>
          </section>
        </div>
      )}

      <style>{`
        .inv-kpi-row {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          margin-bottom: 16px;
        }
        .inv-kpi-card {
          border: 1px solid ${C.border};
          border-radius: 14px;
          padding: 14px;
          background: linear-gradient(140deg, #ffffff 0%, #f7f8fa 100%);
          display: grid;
          gap: 6px;
        }
        .inv-kpi-card span {
          font-size: 11px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          color: ${C.muted};
        }
        .inv-kpi-card strong {
          font-size: 25px;
          line-height: 1;
          color: #1f2b3d;
          font-family: ${font.display};
          font-weight: 700;
        }
        .inv-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        .inv-tab {
          border: 1px solid #d3d8e0;
          border-radius: 8px;
          padding: 8px 12px;
          background: #ffffff;
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
        }
        .inv-tab.active {
          background: #edf4fc;
          border-color: #aac3e0;
          color: #103e73;
        }
        .inv-grid {
          display: grid;
          gap: 14px;
          grid-template-columns: minmax(540px, 1.4fr) minmax(340px, 1fr);
        }
        .inv-grid.single {
          grid-template-columns: 1fr;
        }
        .inv-panel {
          border: 1px solid ${C.border};
          border-radius: 14px;
          padding: 14px;
          background: #ffffff;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
          display: grid;
          gap: 12px;
        }
        .inv-panel h3 {
          margin: 0;
          font-size: 16px;
          color: #1f2937;
        }
        .inv-row-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .inv-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .inv-filter-grid,
        .inv-form-grid {
          display: grid;
          gap: 10px;
        }
        .inv-form-grid {
          grid-template-columns: 1fr 1fr;
        }
        .inv-label {
          font-size: 12px;
          color: ${C.muted};
          margin-bottom: 6px;
          font-weight: 500;
        }
        .inv-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .inv-pill {
          border: 1px solid #d1d7e0;
          border-radius: 999px;
          padding: 6px 11px;
          font-size: 12px;
          background: #f8fafc;
          color: #1f2937;
          cursor: pointer;
          font-weight: 600;
        }
        .inv-pill.active {
          background: #e8f0fb;
          border-color: #93b4dc;
          color: #0f3f73;
        }
        .inv-table-wrap {
          border: 1px solid ${C.border};
          border-radius: 10px;
          overflow: auto;
          max-height: 440px;
        }
        .inv-selected-card {
          border: 1px solid #dce4ef;
          border-radius: 10px;
          padding: 12px;
          background: #f8fbff;
          color: #1f2937;
          display: grid;
          gap: 6px;
        }
        .inv-selected-title {
          color: #1f2937;
        }
        .inv-meta {
          color: #586171;
          font-size: 12px;
        }
        .inv-ok {
          border: 1px solid #bee5c8;
          background: #effaf2;
          color: #22643a;
          border-radius: 10px;
          padding: 12px;
          font-size: 13px;
        }
        .inv-alert-list {
          display: grid;
          gap: 8px;
        }
        .inv-alert-row {
          border: 1px solid #f0c1c1;
          background: #fff6f6;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          color: #7a1f1f;
        }
        .inv-error {
          margin-bottom: 12px;
          padding: 10px 12px;
          border: 1px solid #efc3c3;
          border-radius: 10px;
          background: #fff5f5;
          color: #a42c2c;
          font-size: 12px;
        }
        @media (max-width: 1200px) {
          .inv-kpi-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .inv-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 740px) {
          .inv-kpi-row,
          .inv-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
