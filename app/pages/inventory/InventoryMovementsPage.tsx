import React, { useMemo, useState } from "react";
import { C } from "../../theme/tokens";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { useInventory, type MovementType } from "../../context/InventoryContext";

type MovementSort = "date_desc" | "date_asc" | "qty_desc" | "qty_asc";

const PAGE_SIZE = 8;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InventoryMovementsPage() {
  const { movements, items } = useInventory();

  const [itemFilter, setItemFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | MovementType>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<MovementSort>("date_desc");
  const [page, setPage] = useState(1);

  const prepared = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = movements.filter((move) => {
      const itemMatch = itemFilter === "all" || move.itemId === itemFilter;
      const typeMatch = typeFilter === "all" || move.type === typeFilter;
      const dateMatch = !dateFilter || move.dateTime.startsWith(dateFilter);
      const queryMatch =
        !q ||
        move.itemName.toLowerCase().includes(q) ||
        move.reason.toLowerCase().includes(q) ||
        move.byUser.toLowerCase().includes(q);
      return itemMatch && typeMatch && dateMatch && queryMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      if (sortBy === "date_asc") return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      if (sortBy === "qty_desc") return b.qty - a.qty;
      return a.qty - b.qty;
    });
  }, [movements, itemFilter, typeFilter, dateFilter, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(prepared.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return prepared.slice(start, start + PAGE_SIZE);
  }, [prepared, safePage]);

  return (
    <div>
      <SectionHeader
        title="Stock Movements"
        subtitle="Complete ledger for stock in/out, adjustments, and waste"
      />

      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          <Input
            label="Search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Item, reason, user"
          />

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: C.muted }}>
              Filter by Item
            </label>
            <select
              value={itemFilter}
              onChange={(e) => {
                setItemFilter(e.target.value);
                setPage(1);
              }}
              style={{
                width: "100%",
                border: `0.5px solid ${C.border}`,
                borderRadius: 8,
                padding: "10px 12px",
                background: C.surface,
                fontSize: 13,
              }}
            >
              <option value="all">All Items</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: C.muted }}>
              Filter by Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as "all" | MovementType);
                setPage(1);
              }}
              style={{
                width: "100%",
                border: `0.5px solid ${C.border}`,
                borderRadius: 8,
                padding: "10px 12px",
                background: C.surface,
                fontSize: 13,
              }}
            >
              <option value="all">All Types</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
              <option value="ADJUST">ADJUST</option>
              <option value="WASTE">WASTE</option>
            </select>
          </div>

          <Input
            label="Filter by Date"
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
          />

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: C.muted }}>Sort</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as MovementSort);
                setPage(1);
              }}
              style={{
                width: "100%",
                border: `0.5px solid ${C.border}`,
                borderRadius: 8,
                padding: "10px 12px",
                background: C.surface,
                fontSize: 13,
              }}
            >
              <option value="date_desc">Latest Date</option>
              <option value="date_asc">Oldest Date</option>
              <option value="qty_desc">Qty High-Low</option>
              <option value="qty_asc">Qty Low-High</option>
            </select>
          </div>
        </div>
      </div>

      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
        }}
      >
        <Table
          columns={["Date/Time", "Item", "Type", "Qty", "Reason", "By User"]}
          rows={pageRows.map((move) => {
            const color =
              move.type === "IN"
                ? "success"
                : move.type === "OUT"
                ? "warning"
                : move.type === "ADJUST"
                ? "info"
                : "danger";

            return [
              formatDateTime(move.dateTime),
              move.itemName,
              <Badge label={move.type} color={color} />,
              move.qty,
              move.reason,
              move.byUser,
            ];
          })}
          emptyMessage="No movement records match the selected filters."
        />
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.muted }}>
            Showing {prepared.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, prepared.length)} of {prepared.length}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ border: `0.5px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", background: "transparent", cursor: "pointer" }}
            >
              Prev
            </button>
            <span style={{ fontSize: 12, color: C.muted, alignSelf: "center" }}>Page {safePage} / {totalPages}</span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{ border: `0.5px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", background: "transparent", cursor: "pointer" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
