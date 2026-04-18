import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { C, font } from "../../theme/tokens";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { useInventory } from "../../context/InventoryContext";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InventoryItemDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const {
    items,
    getItemStatus,
    updateItemSettings,
  } = useInventory();

  const item = items.find((x) => x.id === params.id);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [minThreshold, setMinThreshold] = useState(String(item?.minThreshold || 0));
  const [reorderLevel, setReorderLevel] = useState(String(item?.reorderLevel || 0));
  const [supplier, setSupplier] = useState(item?.supplier || "");
  const [location, setLocation] = useState(item?.location || "");

  if (!item) {
    return (
      <div>
        <SectionHeader title="Item Detail" subtitle="Inventory item was not found." />
        <Btn variant="ghost" onClick={() => navigate("/inventory")}>Back to Inventory</Btn>
      </div>
    );
  }

  const status = getItemStatus(item);
  const color = status === "OK" ? "success" : status === "Low Stock" ? "warning" : "danger";

  const saveSettings = () => {
    updateItemSettings({
      itemId: item.id,
      minThreshold: Math.max(0, Number(minThreshold) || 0),
      reorderLevel: Math.max(0, Number(reorderLevel) || 0),
      supplier: supplier || item.supplier,
      location: location || item.location,
    });
    setShowSettingsModal(false);
  };

  return (
    <div>
      <SectionHeader
        title={item.name}
        subtitle="Item settings"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => navigate("/inventory")}>Back</Btn>
            <Btn onClick={() => setShowSettingsModal(true)}>Edit Settings</Btn>
          </div>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <InfoCard label="Current Qty" value={`${item.currentQty} ${item.unit}`} />
        <InfoCard label="Min Threshold" value={`${item.minThreshold} ${item.unit}`} />
        <InfoCard label="Reorder Level" value={`${item.reorderLevel} ${item.unit}`} />
        <InfoCard
          label="Status"
          value={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge label={status} color={color} />
              <Badge label={item.archived ? "Archived" : "Active"} color={item.archived ? "default" : "info"} />
            </div>
          }
        />
      </div>

      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            margin: "0 0 12px",
            fontFamily: font.display,
            fontSize: 16,
            color: C.text,
          }}
        >
          Item Profile
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <ProfileRow label="Supplier" value={item.supplier} />
          <ProfileRow label="Storage Location" value={item.location} />
          <ProfileRow label="Expiry Date" value={item.expiryDate} />
          <ProfileRow label="Last Updated" value={formatDateTime(item.lastUpdated)} />
        </div>
      </div>

      <Modal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Edit Threshold & Reorder Settings"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Min Threshold"
            type="number"
            value={minThreshold}
            onChange={(e) => setMinThreshold(e.target.value)}
            required
          />
          <Input
            label="Reorder Level"
            type="number"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(e.target.value)}
            required
          />
          <Input
            label="Supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            required
          />
          <Input
            label="Storage Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowSettingsModal(false)}>Cancel</Btn>
            <Btn onClick={saveSettings}>Save Changes</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoCard({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `0.5px solid ${C.border}`,
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, color: C.text, fontWeight: 600, fontFamily: font.display }}>{value}</div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        border: `0.5px solid ${C.border}`,
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: C.text }}>{value}</div>
    </div>
  );
}
