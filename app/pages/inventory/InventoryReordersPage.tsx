import React, { useMemo, useState } from "react";
import { C } from "../../theme/tokens";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useInventory } from "../../context/InventoryContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

type ReorderSort = "requested_desc" | "requested_asc" | "qty_desc" | "qty_asc" | "status";

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

export default function InventoryReordersPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const { items, reorderRequests, createReorderRequest, markReorderReceived } = useInventory();
  const activeItems = useMemo(() => items.filter((item) => !item.archived), [items]);

  const [showModal, setShowModal] = useState(false);
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("0");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<ReorderSort>("requested_desc");
  const [page, setPage] = useState(1);

  const selectedItem = activeItems.find((item) => item.id === itemId);

  const prepared = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = reorderRequests.filter((request) => {
      if (!q) return true;
      return (
        request.id.toLowerCase().includes(q) ||
        request.itemName.toLowerCase().includes(q) ||
        request.supplier.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "requested_desc") {
        return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
      }
      if (sortBy === "requested_asc") {
        return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      }
      if (sortBy === "qty_desc") return b.qty - a.qty;
      if (sortBy === "qty_asc") return a.qty - b.qty;
      return a.status.localeCompare(b.status);
    });
  }, [reorderRequests, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(prepared.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return prepared.slice(start, start + PAGE_SIZE);
  }, [prepared, safePage]);

  const submit = () => {
    const numericQty = Number(qty);
    if (!itemId || !Number.isFinite(numericQty) || numericQty <= 0) {
      pushToast("Select an item and enter a valid reorder quantity.", "error");
      return;
    }
    createReorderRequest({
      itemId,
      qty: numericQty,
      requestedBy: user?.name || "Manager",
    });
    setShowModal(false);
    setItemId("");
    setQty("0");
    pushToast("Reorder request created.", "success");
  };

  const onMarkReceived = (requestId: string, itemName: string) => {
    const ok = window.confirm(`Mark reorder for ${itemName} as received?`);
    if (!ok) return;
    markReorderReceived(requestId, user?.name || "Manager");
    pushToast(`${itemName} reorder marked as received.`, "success");
  };

  return (
    <div>
      <SectionHeader
        title="Reorder Requests"
        subtitle="Minimal reorder step for low and out-of-stock items"
        action={<Btn onClick={() => setShowModal(true)}>+ Create Reorder</Btn>}
      />

      <div style={{ marginBottom: 10, display: "grid", gridTemplateColumns: "1fr 240px", gap: 10 }}>
        <Input
          label="Search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Request ID, item, supplier"
        />
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: C.muted }}>Sort</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as ReorderSort);
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
            <option value="requested_desc">Newest Request</option>
            <option value="requested_asc">Oldest Request</option>
            <option value="qty_desc">Qty High-Low</option>
            <option value="qty_asc">Qty Low-High</option>
            <option value="status">Status</option>
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
          columns={[
            "Request #",
            "Item",
            "Supplier",
            "Qty",
            "Status",
            "Requested At",
            "Requested By",
            "Action",
          ]}
          rows={pageRows.map((request) => [
            request.id,
            request.itemName,
            request.supplier,
            request.qty,
            <Badge
              label={request.status}
              color={request.status === "Requested" ? "warning" : "success"}
            />,
            formatDateTime(request.requestedAt),
            request.requestedBy,
            <Btn
              size="sm"
              disabled={request.status === "Received"}
              onClick={() => onMarkReceived(request.id, request.itemName)}
            >
              {request.status === "Received" ? "Received" : "Mark Received"}
            </Btn>,
          ])}
          emptyMessage="No reorder requests yet."
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Reorder Request">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: C.muted }}>
              Item
            </label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              style={{
                width: "100%",
                border: `0.5px solid ${C.border}`,
                borderRadius: 8,
                padding: "10px 12px",
                background: C.surface,
                fontSize: 13,
              }}
            >
              <option value="">Select item</option>
              {activeItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {selectedItem && (
            <div style={{ fontSize: 12, color: C.muted }}>
              Supplier: {selectedItem.supplier} | Current: {selectedItem.currentQty} {selectedItem.unit}
            </div>
          )}
          <Input
            label="Reorder Quantity"
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={submit}>Create Request</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
