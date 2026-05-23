import React from "react";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Table } from "../../../components/ui/Table";
import type { InventoryItem, InventoryMovement } from "../../../types/inventory";

type Props = {
  outItems: InventoryItem[];
  monthMovements: InventoryMovement[];
  items: InventoryItem[];
  monthFilter: string;
  setMonthFilter: (value: string) => void;
};

export function AlertsTab({
  outItems,
  monthMovements,
  items,
  monthFilter,
  setMonthFilter,
}: Props) {
  return (
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
        <Input
          type="month"
          label="Month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        />
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
  );
}
