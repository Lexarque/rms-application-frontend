import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { C, font } from "../../theme/tokens";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { useInventory } from "../../context/InventoryContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

type InventorySort =
  | "updated_desc"
  | "updated_asc"
  | "name_asc"
  | "name_desc"
  | "qty_desc"
  | "qty_asc";

const PAGE_SIZE = 6;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InventoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const { items, getItemStatus, adjustStock, addItem, archiveItem, restoreItem, deleteItem } = useInventory();

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [adjustQty, setAdjustQty] = useState("0");
  const [adjustReason, setAdjustReason] = useState("Manual stock count correction");
  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<InventorySort>("updated_desc");
  const [page, setPage] = useState(1);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [currentQty, setCurrentQty] = useState("0");
  const [minThreshold, setMinThreshold] = useState("0");
  const [reorderLevel, setReorderLevel] = useState("0");
  const [supplier, setSupplier] = useState("");
  const [location, setLocation] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const activeItems = useMemo(() => items.filter((item) => !item.archived), [items]);

  const counts = useMemo(() => {
    const now = new Date();
    const expiringSoon = activeItems.filter(
      (item) =>
        (new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 7
    ).length;

    return {
      total: activeItems.length,
      low: activeItems.filter((item) => getItemStatus(item) === "Low Stock").length,
      out: activeItems.filter((item) => getItemStatus(item) === "Out of Stock").length,
      expiringSoon,
    };
  }, [activeItems, getItemStatus]);

  const preparedItems = useMemo(() => {
    const visible = showArchived ? items : items.filter((item) => !item.archived);
    const q = query.trim().toLowerCase();

    const filtered = visible.filter((item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "updated_desc") {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
      if (sortBy === "updated_asc") {
        return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
      }
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "qty_desc") return b.currentQty - a.currentQty;
      return a.currentQty - b.currentQty;
    });

    return sorted;
  }, [items, showArchived, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(preparedItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return preparedItems.slice(start, start + PAGE_SIZE);
  }, [preparedItems, safePage]);

  const openAdjustModal = (itemId: string) => {
    setSelectedItemId(itemId);
    setAdjustQty("0");
    setAdjustReason("Manual stock count correction");
    setShowAdjustModal(true);
  };

  const submitAdjustment = () => {
    if (!selectedItemId) return;
    const delta = Number(adjustQty);
    if (!Number.isFinite(delta) || delta === 0) {
      pushToast("Enter a valid non-zero adjustment quantity.", "error");
      return;
    }

    adjustStock({
      itemId: selectedItemId,
      delta,
      reason: adjustReason || "Manual adjustment",
      byUser: user?.name || "Manager",
    });

    setShowAdjustModal(false);
    pushToast("Stock adjustment saved.", "success");
  };

  const submitAddItem = () => {
    const qtyValue = Number(currentQty);
    const thresholdValue = Number(minThreshold);
    const reorderValue = Number(reorderLevel);

    if (!name.trim() || !unit.trim() || !supplier.trim() || !location.trim() || !expiryDate) {
      pushToast("Fill in all required fields before creating an item.", "error");
      return;
    }
    if (!Number.isFinite(qtyValue) || !Number.isFinite(thresholdValue) || !Number.isFinite(reorderValue)) {
      pushToast("Quantity, threshold, and reorder level must be valid numbers.", "error");
      return;
    }

    addItem({
      name,
      unit,
      currentQty: Math.max(0, qtyValue),
      minThreshold: Math.max(0, thresholdValue),
      reorderLevel: Math.max(0, reorderValue),
      supplier,
      location,
      expiryDate,
    });

    setName("");
    setUnit("");
    setCurrentQty("0");
    setMinThreshold("0");
    setReorderLevel("0");
    setSupplier("");
    setLocation("");
    setExpiryDate("");
    setShowAddModal(false);
    pushToast("Inventory item created.", "success");
  };

  const confirmArchiveToggle = (itemId: string, archived: boolean, itemName: string) => {
    const action = archived ? "restore" : "archive";
    const ok = window.confirm(`Are you sure you want to ${action} ${itemName}?`);
    if (!ok) return;

    if (archived) {
      restoreItem(itemId);
      pushToast(`${itemName} restored.`, "success");
    } else {
      archiveItem(itemId);
      pushToast(`${itemName} archived.`, "info");
    }
  };

  const confirmDelete = (itemId: string, itemName: string) => {
    const ok = window.confirm(
      `Delete ${itemName}? This removes movement and reorder records for this item.`
    );
    if (!ok) return;
    deleteItem(itemId);
    pushToast(`${itemName} deleted.`, "success");
  };

  return (
    <div>
      <SectionHeader
        title="Inventory Overview"
        subtitle="Manage inventory items, stock movements, and reorder flow"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => navigate("/inventory/movements")}>View History</Btn>
            <Btn variant="ghost" onClick={() => navigate("/inventory/reorders")}>Reorders</Btn>
            <Btn onClick={() => setShowAddModal(true)}>+ Add Item</Btn>
          </div>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard label="Total Items" value={counts.total} icon="📦" />
        <StatCard label="Low Stock" value={counts.low} icon="⚠️" trend={counts.low > 0 ? -1 : 0} />
        <StatCard label="Out of Stock" value={counts.out} icon="⛔" trend={counts.out > 0 ? -1 : 0} />
        <StatCard label="Expiring Soon" value={counts.expiringSoon} icon="🧪" trend={counts.expiringSoon > 0 ? -1 : 0} />
      </div>

      <div style={{ marginBottom: 10, display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10, alignItems: "center" }}>
        <Input label="Search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search ingredient, supplier, location" />
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: C.muted }}>Sort</label>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as InventorySort); setPage(1); }}
            style={{ border: `0.5px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", background: C.surface, fontSize: 13 }}
          >
            <option value="updated_desc">Latest Updated</option>
            <option value="updated_asc">Oldest Updated</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="qty_desc">Qty High-Low</option>
            <option value="qty_asc">Qty Low-High</option>
          </select>
        </div>
        <label style={{ fontSize: 12, color: C.muted, display: "flex", gap: 6, alignItems: "center", marginTop: 18 }}>
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => {
              setShowArchived(e.target.checked);
              setPage(1);
            }}
          />
          Show archived
        </label>
        <div style={{ marginTop: 18 }}>
          <Btn variant="ghost" size="sm" onClick={() => navigate("/inventory/alerts")}>View Alerts</Btn>
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
          columns={[
            "Ingredient",
            "Current Qty",
            "Unit",
            "Min Threshold",
            "Status",
            "State",
            "Last Updated",
            "Actions",
          ]}
          rows={pagedItems.map((item) => {
            const status = getItemStatus(item);
            const badgeColor =
              status === "OK" ? "success" : status === "Low Stock" ? "warning" : "danger";

            return [
              item.name,
              item.currentQty,
              item.unit,
              item.minThreshold,
              <Badge label={status} color={badgeColor} />,
              <Badge label={item.archived ? "Archived" : "Active"} color={item.archived ? "default" : "info"} />,
              formatDateTime(item.lastUpdated),
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn size="sm" variant="ghost" onClick={() => navigate(`/inventory/items/${item.id}`)}>
                  View
                </Btn>
                {!item.archived && (
                  <Btn size="sm" variant="ghost" onClick={() => openAdjustModal(item.id)}>
                    Adjust
                  </Btn>
                )}
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() => confirmArchiveToggle(item.id, item.archived, item.name)}
                >
                  {item.archived ? "Restore" : "Archive"}
                </Btn>
                <Btn size="sm" variant="danger" onClick={() => confirmDelete(item.id, item.name)}>
                  Delete
                </Btn>
              </div>,
            ];
          })}
          emptyMessage="No items match your search/filter."
        />
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.muted }}>
            Showing {preparedItems.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, preparedItems.length)} of {preparedItems.length}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" variant="ghost" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Btn>
            <span style={{ fontSize: 12, color: C.muted, alignSelf: "center" }}>Page {safePage} / {totalPages}</span>
            <Btn size="sm" variant="ghost" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Btn>
          </div>
        </div>
      </div>

      <Modal
        open={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Adjust Stock"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              border: `0.5px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontFamily: font.body,
              fontSize: 12,
              color: C.muted,
            }}
          >
            Enter positive value to increase stock, negative value to decrease stock.
          </div>
          <Input
            label="Quantity Delta"
            type="number"
            value={adjustQty}
            onChange={(e) => setAdjustQty(e.target.value)}
            placeholder="e.g. 5 or -2"
            required
          />
          <Input
            label="Reason"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            placeholder="Reason for adjustment"
            required
          />
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <Btn variant="ghost" onClick={() => setShowAdjustModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={submitAdjustment}>Save Adjustment</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Item">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Item Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} required />
          <Input label="Current Quantity" type="number" value={currentQty} onChange={(e) => setCurrentQty(e.target.value)} required />
          <Input label="Min Threshold" type="number" value={minThreshold} onChange={(e) => setMinThreshold(e.target.value)} required />
          <Input label="Reorder Level" type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} required />
          <Input label="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} required />
          <Input label="Storage Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          <Input label="Expiry Date" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={submitAddItem}>Create Item</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
