import { Badge } from "../../../components/ui/Badge";
import { Btn } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Table } from "../../../components/ui/Table";
import { C } from "../../../theme/tokens";
import type { InventoryItem, InventoryStatus, MovementType } from "../../../types/inventory";

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
  setSelectedId: (id: string) => void;
  setMovementItemQuery: (value: string) => void;
  setAdjustType: (value: MovementType) => void;
  setAdjustQty: (value: number | "") => void;
  setAdjustNote: (value: string) => void;
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
  setSelectedId,
  setMovementItemQuery,
  setAdjustType,
  setAdjustQty,
  setAdjustNote,
  onAddMovementLine,
  onRemoveMovementLine,
  onClearMovementLines,
  onSubmitMovementLines,
}: Props) {
  const parsedAdjustQty = adjustQty === "" ? 0 : Number(adjustQty);

  const statusFor = (qty: number, min: number): InventoryStatus => {
    if (qty <= 0) return "OUT";
    if (qty <= min) return "LOW";
    return "AVAILABLE";
  };
  const statusColor = (status: "AVAILABLE" | "LOW" | "OUT"): "success" | "warning" | "danger" => {
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

  const selectedStatus = selectedItem
    ? statusFor(selectedItem.quantity, selectedItem.minimum_threshold)
    : null;
  const selectedFillPct = selectedItem
    ? Math.min(
        100,
        Math.round(
          (selectedItem.quantity / Math.max(selectedItem.minimum_threshold * 2, selectedItem.quantity, 1)) * 100
        )
      )
    : 0;
  const selectedFillColor =
    selectedStatus === "OUT" ? C.danger : selectedStatus === "LOW" ? C.warning : C.success;

  return (
    <div className="inv-grid single">
      <section className="inv-panel">
        <div className="inv-row-between">
          <div>
            <h3>Batch Stock Movement</h3>
            <p className="inv-subtle">Queue multiple lines, review impact, then submit once</p>
          </div>
          {selectedItem && selectedStatus && (
            <div className="inv-snapshot">
              <div className="inv-snapshot-head">
                <strong>{selectedItem.item_name}</strong>
                <Badge label={selectedStatus} color={statusColor(selectedStatus)} />
              </div>
              <div className="inv-meter">
                <div
                  className="inv-meter-fill"
                  style={{ width: `${selectedFillPct}%`, background: selectedFillColor }}
                />
              </div>
              <div className="inv-snapshot-meta">
                <span>{selectedItem.quantity} {selectedItem.unit} on hand</span>
                <span>Min {selectedItem.minimum_threshold} {selectedItem.unit}</span>
              </div>
            </div>
          )}
        </div>
        <div className="inv-form-grid">
          <div className="inv-span-2">
            <div className="inv-label">Product</div>
            <div className="inv-product-controls">
              <input
                type="text"
                value={movementItemQuery}
                onChange={(e) => setMovementItemQuery(e.target.value)}
                placeholder="Search product..."
                className="inv-control"
              />
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="inv-control"
              >
                {movementItemOptions.length === 0 && <option value="">No matching products</option>}
                {movementItemOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="inv-label">Movement Type</div>
            <div className="inv-pills inv-segment">
              {(["IN", "OUT"] as MovementType[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setAdjustType(value)}
                  className={adjustType === value ? "inv-pill active" : "inv-pill"}
                >
                  {value === "IN" ? "↗ IN" : "↘ OUT"}
                </button>
              ))}
            </div>
          </div>
          <Input
            label={`Quantity (${selectedItem?.unit ?? "unit"})`}
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
          <div className="inv-span-2">
            <Input
              label="Note"
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
              placeholder="Reason for this movement line"
            />
          </div>
        </div>
        <div className="inv-actions">
          <Btn onClick={onAddMovementLine} disabled={parsedAdjustQty <= 0 || !selectedItem}>
            Add to Queue
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
    </div>
  );
}
