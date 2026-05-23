import React from "react";
import { Badge } from "../../../components/ui/Badge";
import { Btn } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Table } from "../../../components/ui/Table";
import { C, font } from "../../../theme/tokens";
import type {
  InventoryItem,
  InventoryMovement,
  MovementType,
} from "../../../types/inventory";

type Props = {
  items: InventoryItem[];
  selectedId: string;
  selectedItem: InventoryItem | null;
  movementItemQuery: string;
  movementItemOptions: InventoryItem[];
  adjustType: MovementType;
  adjustQty: number | "";
  adjustNote: string;
  movementLines: {
    id: string;
    itemId: string;
    itemName: string;
    unit: string;
    movementType: MovementType;
    quantity: number;
    note: string;
  }[];
  monthFilter: string;
  selectedMovements: InventoryMovement[];
  setSelectedId: (id: string) => void;
  setMovementItemQuery: (value: string) => void;
  setAdjustType: (value: MovementType) => void;
  setAdjustQty: (value: number | "") => void;
  setAdjustNote: (value: string) => void;
  setMonthFilter: (value: string) => void;
  onAddMovementLine: () => boolean;
  onRemoveMovementLine: (lineId: string) => void;
  onClearMovementLines: () => void;
  onSubmitMovementLines: () => void;
};

export function MovementTab({
  items,
  selectedId,
  selectedItem,
  movementItemQuery,
  movementItemOptions,
  adjustType,
  adjustQty,
  adjustNote,
  movementLines,
  monthFilter,
  selectedMovements,
  setSelectedId,
  setMovementItemQuery,
  setAdjustType,
  setAdjustQty,
  setAdjustNote,
  setMonthFilter,
  onAddMovementLine,
  onRemoveMovementLine,
  onClearMovementLines,
  onSubmitMovementLines,
}: Props) {
  const parsedAdjustQty = adjustQty === "" ? 0 : Number(adjustQty);
  const quickQty = [10, 25, 50];
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const statusFor = (qty: number, min: number) => {
    if (qty <= 0) return "OUT";
    if (qty <= min) return "LOW";
    return "AVAILABLE";
  };
  const statusColor = (status: "AVAILABLE" | "LOW" | "OUT") => {
    if (status === "OUT") return "danger" as const;
    if (status === "LOW") return "warning" as const;
    return "success" as const;
  };

  const previewMap = new Map(
    items.map((item) => [
      item.id,
      {
        id: item.id,
        name: item.item_name,
        unit: item.unit,
        min: item.minimum_threshold,
        before: item.quantity,
        after: item.quantity,
      },
    ])
  );
  const lineWarnings = new Map<string, string>();
  const hasQueuedEquivalentDraft =
    !!selectedItem &&
    movementLines.some(
      (line) =>
        line.itemId === selectedItem.id &&
        line.movementType === adjustType &&
        line.quantity === parsedAdjustQty
    );
  const hasDraftImpact =
    !!selectedItem &&
    Number.isFinite(parsedAdjustQty) &&
    parsedAdjustQty > 0 &&
    !hasQueuedEquivalentDraft;

  const simulatedLines = [...movementLines];
  if (hasDraftImpact && selectedItem) {
    simulatedLines.push({
      id: "__draft__",
      itemId: selectedItem.id,
      itemName: selectedItem.item_name,
      unit: selectedItem.unit,
      movementType: adjustType,
      quantity: parsedAdjustQty,
      note: adjustNote.trim() || "Draft line",
    });
  }

  for (const line of simulatedLines) {
    const entry = previewMap.get(line.itemId);
    if (!entry) {
      lineWarnings.set(line.id, "Item not found");
      continue;
    }
    const beforeLine = entry.after;
    if (line.movementType === "IN") entry.after += line.quantity;
    if (line.movementType === "OUT") {
      if (beforeLine - line.quantity < 0) {
        lineWarnings.set(line.id, "Would go negative");
      }
      entry.after -= line.quantity;
    }
    if (line.movementType === "ADJUST") entry.after = line.quantity;
  }

  const previewRows = Array.from(previewMap.values())
    .filter((row) => row.before !== row.after)
    .map((row) => {
      const beforeStatus = statusFor(row.before, row.min);
      const afterStatus = statusFor(row.after, row.min);
      return { ...row, beforeStatus, afterStatus };
    });

  return (
    <div className="inv-grid">
      <section className="inv-panel">
        <div className="inv-row-between">
          <div>
            <h3>Batch Stock Movement</h3>
            <p className="inv-subtle">Queue multiple lines, review impact, then submit once</p>
          </div>
          {selectedItem && (
            <div className="inv-snapshot">
              <strong>{selectedItem.item_name}</strong>
              <span>{selectedItem.quantity} {selectedItem.unit} on hand</span>
              <span>Min: {selectedItem.minimum_threshold} {selectedItem.unit}</span>
              <Badge
                label={statusFor(selectedItem.quantity, selectedItem.minimum_threshold)}
                color={statusColor(statusFor(selectedItem.quantity, selectedItem.minimum_threshold))}
              />
            </div>
          )}
        </div>
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
            <div className="inv-pills inv-segment">
              {(["IN", "OUT", "ADJUST"] as MovementType[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setAdjustType(value)}
                  className={adjustType === value ? "inv-pill active" : "inv-pill"}
                >
                  {value === "IN" ? "↗ IN" : value === "OUT" ? "↘ OUT" : "⟲ ADJUST"}
                </button>
              ))}
            </div>
          </div>
          <Input
            label={adjustType === "ADJUST" ? `Set final quantity (${selectedItem?.unit ?? "unit"})` : `Quantity (${selectedItem?.unit ?? "unit"})`}
            type="number"
            value={adjustQty}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setAdjustQty("");
                return;
              }
              setAdjustQty(Math.max(0, Number(value) || 0));
            }}
          />
          <Input
            label="Note"
            value={adjustNote}
            onChange={(e) => setAdjustNote(e.target.value)}
            placeholder="Reason for this movement line"
          />
        </div>
        <div>
          <div className="inv-label">Quick Quantity</div>
          <div className="inv-actions">
            {quickQty.map((value) => (
              <Btn key={value} size="sm" variant="ghost" onClick={() => setAdjustQty(value)}>
                +{value}
              </Btn>
            ))}
            <Btn size="sm" variant="ghost" onClick={() => setAdjustQty(0)}>
              Set 0
            </Btn>
          </div>
        </div>
        <div className="inv-actions">
          <Btn onClick={onAddMovementLine} disabled={parsedAdjustQty <= 0 || !selectedItem}>
            Add Line
          </Btn>
          <Btn
            variant="ghost"
            onClick={onClearMovementLines}
            disabled={movementLines.length === 0}
          >
            Clear Queue
          </Btn>
        </div>

        <div className="inv-table-wrap">
          <Table
            columns={["Item", "Type", "Qty", "Note", "Validation", "Action"]}
            rows={movementLines.map((line) => [
              line.itemName,
              <Badge
                label={line.movementType}
                color={
                  line.movementType === "IN"
                    ? "success"
                    : line.movementType === "OUT"
                      ? "danger"
                      : "info"
                }
              />,
              `${line.quantity} ${line.unit}`,
              line.note,
              lineWarnings.has(line.id) ? (
                <Badge label={lineWarnings.get(line.id) as string} color="danger" />
              ) : (
                <Badge label="OK" color="success" />
              ),
              <Btn variant="ghost" size="sm" onClick={() => onRemoveMovementLine(line.id)}>
                Remove
              </Btn>,
            ])}
            emptyMessage="No movement lines added."
          />
        </div>

        <div className="inv-preview-box">
          <div className="inv-row-between">
            <strong>Impact Preview</strong>
            <span className="inv-meta">
              {previewRows.length} item{previewRows.length === 1 ? "" : "s"} will change
            </span>
          </div>
          {previewRows.length === 0 ? (
            <div className="inv-meta">No quantity changes queued yet.</div>
          ) : (
            <div className="inv-preview-list">
              {hasDraftImpact && (
                <div className="inv-meta" style={{ marginBottom: 2 }}>
                  Preview includes current draft line (not yet added).
                </div>
              )}
              {previewRows.map((row) => (
                <div key={row.id} className="inv-preview-row">
                  <div>
                    <strong>{row.name}</strong>
                    <div className="inv-meta">
                      {row.before} → {row.after} {row.unit}
                    </div>
                  </div>
                  <div className="inv-actions">
                    <Badge label={row.beforeStatus} color={statusColor(row.beforeStatus)} />
                    <span className="inv-meta">→</span>
                    <Badge label={row.afterStatus} color={statusColor(row.afterStatus)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="inv-sticky-submit">
          <Btn
            variant="ghost"
            onClick={onClearMovementLines}
            disabled={movementLines.length === 0}
          >
            Clear Queue
          </Btn>
          <Btn onClick={onSubmitMovementLines} disabled={movementLines.length === 0}>
            Submit {movementLines.length} Movement{movementLines.length === 1 ? "" : "s"}
          </Btn>
        </div>
      </section>

      <section className="inv-panel">
        <h3>Selected Item Monthly History</h3>
        <div className="inv-actions">
          <Btn size="sm" variant="ghost" onClick={() => setMonthFilter(thisMonth)}>
            This Month
          </Btn>
          <Btn size="sm" variant="ghost" onClick={() => setMonthFilter(lastMonth)}>
            Last Month
          </Btn>
        </div>
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
  );
}
