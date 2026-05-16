import React, { useEffect, useMemo, useState } from "react";
import { C, font } from "../theme/tokens";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Btn } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Table } from "../components/ui/Table";
import {
  fetchInventoryItemMovements,
  fetchInventoryItems,
  fetchInventoryMovements,
} from "../queries/inventory/inventoryApi";
import type { InventoryItem, InventoryMovement } from "../types/inventory";

// Define the shape of the report card data
interface ReportCardData {
  key: "sales" | "inventory" | "orders" | "staff";
  label: string;
  icon: string;
  desc: string;
}

// Extracted outside the component for better performance
const REPORT_CARDS: ReportCardData[] = [
  {
    key: "sales",
    label: "Sales Report",
    icon: "💰",
    desc: "Daily, weekly, monthly revenue breakdown",
  },
  {
    key: "inventory",
    label: "Inventory Report",
    icon: "📦",
    desc: "Stock levels and depletion history",
  },
  {
    key: "orders",
    label: "Order History",
    icon: "📋",
    desc: "All processed orders and their details",
  },
  {
    key: "staff",
    label: "Staff Activity",
    icon: "👥",
    desc: "Login logs, shift records, and actions",
  },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportCardData["key"] | null>(null);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [scope, setScope] = useState<"all" | "item">("all");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);
  const [inventoryError, setInventoryError] = useState("");

  useEffect(() => {
    if (activeReport !== "inventory") return;

    const loadItems = async () => {
      try {
        const data = await fetchInventoryItems();
        setItems(data);
        setSelectedItemId((prev) => prev || data[0]?.id || "");
      } catch {
        setInventoryError("Failed to load inventory items.");
      }
    };

    void loadItems();
  }, [activeReport]);

  useEffect(() => {
    if (activeReport !== "inventory") return;

    const loadMovements = async () => {
      setInventoryError("");
      setIsLoadingMovements(true);
      try {
        const data =
          scope === "item" && selectedItemId
            ? await fetchInventoryItemMovements(selectedItemId, monthFilter)
            : await fetchInventoryMovements(monthFilter);
        setMovements(data);
      } catch {
        setInventoryError("Failed to load inventory movements.");
        setMovements([]);
      } finally {
        setIsLoadingMovements(false);
      }
    };

    if (scope === "item" && !selectedItemId) {
      setMovements([]);
      return;
    }

    void loadMovements();
  }, [activeReport, monthFilter, scope, selectedItemId]);

  const movementSummary = useMemo(() => {
    const incoming = movements
      .filter((m) => m.movement_type === "IN")
      .reduce((sum, m) => sum + m.quantity, 0);
    const outgoing = movements
      .filter((m) => m.movement_type === "OUT")
      .reduce((sum, m) => sum + m.quantity, 0);
    const adjusted = movements.filter((m) => m.movement_type === "ADJUST").length;
    return { incoming, outgoing, adjusted, total: movements.length };
  }, [movements]);

  const itemNameById = useMemo(() => {
    return new Map(items.map((item) => [item.id, item.item_name]));
  }, [items]);

  return (
    <div>
      <SectionHeader
        title="Reports"
        subtitle="Sales, inventory, and staff activity summaries"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {REPORT_CARDS.map((r) => (
          <div
            key={r.label} // Used a stable string key instead of the array index
            style={{
              background: C.surface,
              border: `0.5px solid ${C.border}`,
              borderRadius: 14,
              padding: "20px 22px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{r.icon}</div>
            <div
              style={{
                fontFamily: font.display,
                fontSize: 15,
                fontWeight: 600,
                color: C.text,
                marginBottom: 6,
              }}
            >
              {r.label}
            </div>
            <div
              style={{ fontSize: 12, color: C.muted, fontFamily: font.body }}
            >
              {r.desc}
            </div>
            <div style={{ marginTop: 16 }}>
              <Btn variant="ghost" size="sm" onClick={() => setActiveReport(r.key)}>
                View Report
              </Btn>
            </div>
          </div>
        ))}
      </div>

      {activeReport === "inventory" && (
        <div
          style={{
            marginTop: 14,
            background: C.surface,
            border: `0.5px solid ${C.border}`,
            borderRadius: 14,
            padding: "20px 22px",
            display: "grid",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 700, color: C.text }}>
                Inventory Report
              </div>
              <div style={{ color: C.muted, fontSize: 13 }}>
                Movement history by month across all items or one selected item
              </div>
            </div>
            <Btn size="sm" variant="ghost" onClick={() => setActiveReport(null)}>
              Close
            </Btn>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <Input
              type="month"
              label="Month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.muted, fontFamily: font.body }}>
                Scope
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as "all" | "item")}
                style={{
                  border: `0.5px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontFamily: font.body,
                  color: C.text,
                  background: C.surface,
                  outline: "none",
                }}
              >
                <option value="all">All Inventory Items</option>
                <option value="item">Single Item</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.muted, fontFamily: font.body }}>
                Item
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                disabled={scope !== "item"}
                style={{
                  border: `0.5px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontFamily: font.body,
                  color: C.text,
                  background: scope === "item" ? C.surface : "#f5f5f5",
                  outline: "none",
                }}
              >
                {items.length === 0 && <option value="">No items</option>}
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
            <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
              <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.3 }}>Total Logs</div>
              <div style={{ fontSize: 22, fontFamily: font.display, fontWeight: 700, color: C.text }}>{movementSummary.total}</div>
            </div>
            <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
              <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.3 }}>Stock In</div>
              <div style={{ fontSize: 22, fontFamily: font.display, fontWeight: 700, color: C.success }}>{movementSummary.incoming}</div>
            </div>
            <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
              <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.3 }}>Stock Out</div>
              <div style={{ fontSize: 22, fontFamily: font.display, fontWeight: 700, color: C.danger }}>{movementSummary.outgoing}</div>
            </div>
            <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
              <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.3 }}>Adjustments</div>
              <div style={{ fontSize: 22, fontFamily: font.display, fontWeight: 700, color: C.info }}>{movementSummary.adjusted}</div>
            </div>
          </div>

          {inventoryError && (
            <div style={{ border: "1px solid #efc3c3", background: "#fff5f5", color: "#a42c2c", borderRadius: 10, padding: 10, fontSize: 12 }}>
              {inventoryError}
            </div>
          )}

          <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
            <Table
              columns={["Date", "Item", "Type", "Quantity", "Reference", "Performed By", "Note"]}
              rows={movements.map((m) => [
                m.created_at || "-",
                itemNameById.get(m.item_id) ?? m.item_id,
                <Badge
                  label={m.movement_type}
                  color={
                    m.movement_type === "IN"
                      ? "success"
                      : m.movement_type === "OUT"
                      ? "danger"
                      : "info"
                  }
                />,
                String(m.quantity),
                m.reference || "-",
                m.performed_by || "-",
                m.note || "-",
              ])}
              emptyMessage={isLoadingMovements ? "Loading movement history..." : "No movement records found for this filter."}
            />
          </div>
        </div>
      )}
    </div>
  );
}
