import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { C } from "../../theme/tokens";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useInventory } from "../../context/InventoryContext";
import { useToast } from "../../context/ToastContext";

type AlertSort = "created_desc" | "created_asc" | "type";

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

function severity(type: "Low" | "Out" | "Expiring") {
  if (type === "Out") return 1;
  if (type === "Low") return 2;
  return 3;
}

export default function InventoryAlertsPage() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { alerts, markAlertsResolved } = useInventory();

  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<AlertSort>("created_desc");
  const [page, setPage] = useState(1);

  const prepared = useMemo(() => {
    const q = query.trim().toLowerCase();
    const unresolved = alerts.filter((alert) => !alert.resolved);

    const filtered = unresolved.filter((alert) => {
      if (!q) return true;
      return alert.itemName.toLowerCase().includes(q) || alert.message.toLowerCase().includes(q);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "created_desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "created_asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return severity(a.type) - severity(b.type);
    });
  }, [alerts, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(prepared.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return prepared.slice(start, start + PAGE_SIZE);
  }, [prepared, safePage]);

  const toggle = (alertId: string) => {
    setSelected((prev) =>
      prev.includes(alertId) ? prev.filter((id) => id !== alertId) : [...prev, alertId]
    );
  };

  const bulkResolve = () => {
    if (selected.length === 0) {
      pushToast("Select at least one alert to resolve.", "error");
      return;
    }
    const ok = window.confirm(`Resolve ${selected.length} selected alert(s)?`);
    if (!ok) return;

    markAlertsResolved(selected);
    setSelected([]);
    pushToast("Selected alerts resolved.", "success");
  };

  return (
    <div>
      <SectionHeader
        title="Inventory Alerts"
        subtitle="Focus list for low stock, out of stock, and expiring items"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => navigate("/inventory/reorders")}>Open Reorders</Btn>
            <Btn onClick={bulkResolve} disabled={selected.length === 0}>Mark Resolved</Btn>
          </div>
        }
      />

      <div style={{ marginBottom: 10, display: "grid", gridTemplateColumns: "1fr 240px", gap: 10 }}>
        <Input
          label="Search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search item or message"
        />
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: C.muted }}>Sort</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as AlertSort);
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
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="type">By Severity</option>
          </select>
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
          columns={["Select", "Item", "Alert Type", "Message", "Created", "Action"]}
          rows={pageRows.map((alert) => {
            const color =
              alert.type === "Out" ? "danger" : alert.type === "Low" ? "warning" : "info";
            const checked = selected.includes(alert.id);

            return [
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(alert.id)}
                aria-label={`Select alert ${alert.id}`}
              />,
              alert.itemName,
              <Badge label={alert.type} color={color} />,
              alert.message,
              formatDateTime(alert.createdAt),
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => {
                  const ok = window.confirm(`Resolve alert for ${alert.itemName}?`);
                  if (!ok) return;
                  markAlertsResolved([alert.id]);
                  setSelected((prev) => prev.filter((id) => id !== alert.id));
                  pushToast(`Alert for ${alert.itemName} resolved.`, "success");
                }}
              >
                Resolve
              </Btn>,
            ];
          })}
          emptyMessage="No active alerts."
        />
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.muted }}>
            Showing {prepared.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, prepared.length)} of {prepared.length}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" variant="ghost" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Btn>
            <span style={{ fontSize: 12, color: C.muted, alignSelf: "center" }}>Page {safePage} / {totalPages}</span>
            <Btn size="sm" variant="ghost" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
