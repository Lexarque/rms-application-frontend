import React from "react";
import { Badge } from "../../../components/ui/Badge";
import { Btn } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Table } from "../../../components/ui/Table";
import { C } from "../../../theme/tokens";
import type {
  DraftItem,
  InventoryItem,
  StatusFilter,
} from "../../../types/inventory";
import { badgeColor, statusOf } from "../utils";

type Props = {
  selectedItem: InventoryItem | null;
  filteredItems: InventoryItem[];
  draftItem: DraftItem;
  draftMode: "add" | "edit";
  statusFilter: StatusFilter;
  query: string;
  setStatusFilter: (value: StatusFilter) => void;
  setQuery: (value: string) => void;
  setSelectedId: (id: string) => void;
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
  onOpenAdd: () => void;
  onOpenEdit: () => void;
  onDelete: () => void;
  onSave: () => Promise<void>;
};

export function CatalogTab({
  selectedItem,
  filteredItems,
  draftItem,
  draftMode,
  statusFilter,
  query,
  setStatusFilter,
  setQuery,
  setSelectedId,
  setDraftItem,
  onOpenAdd,
  onOpenEdit,
  onDelete,
  onSave,
}: Props) {
  const statusCounts = filteredItems.reduce(
    (acc, item) => {
      const s = statusOf(item);
      acc.ALL += 1;
      acc[s] += 1;
      return acc;
    },
    { ALL: 0, AVAILABLE: 0, LOW: 0, OUT: 0 }
  );
  const selectedFill = selectedItem
    ? Math.min(
        100,
        Math.round(
          (selectedItem.minimum_threshold <= 0
            ? selectedItem.quantity > 0
              ? 100
              : 0
            : (selectedItem.quantity / selectedItem.minimum_threshold) * 100)
        )
      )
    : 0;

  return (
    <div className="inv-grid">
      <section className="inv-panel">
        <div className="inv-row-between">
          <div>
            <h3>Item Registry</h3>
            <p className="inv-subtle">Browse, filter, and update stock records</p>
          </div>
          <div className="inv-actions">
            <Btn size="sm" variant="ghost" onClick={onOpenAdd}>New Item</Btn>
            <Btn size="sm" variant="ghost" onClick={onOpenEdit} disabled={!selectedItem}>Edit Selected</Btn>
            <Btn size="sm" variant="danger" onClick={onDelete} disabled={!selectedItem}>Delete</Btn>
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
                  {value} <span className="inv-pill-count">{statusCounts[value]}</span>
                </button>
              ))}
            </div>
            {(query.trim() || statusFilter !== "ALL") && (
              <div className="inv-filter-summary">
                Showing {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}
                {query.trim() ? ` matching "${query.trim()}"` : ""}
                {statusFilter !== "ALL" ? ` with status ${statusFilter}` : ""}.
              </div>
            )}
          </div>
        </div>

        <div className="inv-table-wrap">
          <Table
            columns={["Item Name", "Qty", "Min Threshold", "Status", "Last Updated"]}
            rows={filteredItems.map((item) => [
              <div style={{ display: "grid", gap: 2 }}>
                <div style={{ fontWeight: 700, color: item.id === selectedItem?.id ? C.accent : C.text }}>
                  {item.item_name}
                </div>
                <span className="inv-meta">Category: {item.category || "-"}</span>
              </div>,
              <span style={{ fontWeight: 600 }}>{item.quantity} {item.unit}</span>,
              <span className="inv-meta">{item.minimum_threshold} {item.unit}</span>,
              <Badge label={statusOf(item)} color={badgeColor(statusOf(item))} />,
              item.last_updated,
            ])}
            onRowClick={(index) => setSelectedId(filteredItems[index].id)}
            emptyMessage="No matching inventory items."
          />
        </div>
      </section>

      <section className="inv-panel">
        <div>
          <h3>{draftMode === "add" ? "Add Inventory Item" : "Edit Inventory Item"}</h3>
          <p className="inv-subtle">Use this form to maintain the selected stock record</p>
        </div>
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
            onChange={(e) => {
              const value = e.target.value;
              setDraftItem((prev) => ({
                ...prev,
                quantity: value === "" ? "" : Math.max(0, Number(value) || 0),
              }));
            }}
          />
          <Input
            type="number"
            label="Minimum Threshold"
            value={draftItem.minimum_threshold}
            onChange={(e) => {
              const value = e.target.value;
              setDraftItem((prev) => ({
                ...prev,
                minimum_threshold: value === "" ? "" : Math.max(0, Number(value) || 0),
              }));
            }}
          />
        </div>

        <div className="inv-actions">
          <Btn onClick={() => void onSave()}>{draftMode === "add" ? "Create Item" : "Save Changes"}</Btn>
          <Btn variant="ghost" onClick={onOpenAdd}>Clear Form</Btn>
        </div>

        {selectedItem ? (
          <div className="inv-selected-card">
            <div className="inv-row-between">
              <strong className="inv-selected-title">{selectedItem.item_name}</strong>
              <Badge label={statusOf(selectedItem)} color={badgeColor(statusOf(selectedItem))} />
            </div>
            <div className="inv-meter">
              <div className="inv-meter-fill" style={{ width: `${selectedFill}%` }} />
            </div>
            <div className="inv-meta">
              Stock Health: {selectedFill}% of threshold target
            </div>
            <div className="inv-meta">Quantity: {selectedItem.quantity} {selectedItem.unit}</div>
            <div className="inv-meta">Threshold: {selectedItem.minimum_threshold} {selectedItem.unit}</div>
            <div className="inv-meta">Last updated: {selectedItem.last_updated}</div>
          </div>
        ) : (
          <div className="inv-selected-card">
            <div className="inv-meta">No selected item. Create one to start stock operations.</div>
          </div>
        )}
      </section>
    </div>
  );
}
