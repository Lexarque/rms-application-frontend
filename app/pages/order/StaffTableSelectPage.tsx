import React, { useState } from "react";
import { useNavigate } from "react-router";
import { C, font } from "~/theme/tokens";
import { Btn } from "~/components/ui/Button";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { useRestaurantTables } from "~/hooks/useRestaurantTables";
import { useOrderSession } from "~/context/OrderSessionContext";

export default function StaffTableSelectPage() {
  const navigate = useNavigate();
  const { session, setSession } = useOrderSession();
  const { data: tables = [], isLoading } = useRestaurantTables();
  const [selectedTableId, setSelectedTableId] = useState(session?.tableId ?? "");
  const [error, setError] = useState<string | null>(null);

  const activeTables = tables.filter((t) => t.isActive);

  const handleConfirm = () => {
    const table = tables.find((t) => t.id === selectedTableId);
    if (!table) {
      setError("Please select a table.");
      return;
    }

    setSession({
      tableId: table.id,
      tableNumber: table.tableNumber,
      type: "DINE_IN",
    });

    navigate("/order/menu");
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
      <SectionHeader
        title="Select Table"
        subtitle="Choose the table for this dine-in order"
      />

      {error && (
        <p style={{ color: C.danger, fontFamily: font.body, fontSize: 13, marginBottom: 12 }}>
          {error}
        </p>
      )}

      {isLoading ? (
        <p style={{ fontFamily: font.body, color: C.muted }}>Loading tables...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 12, marginBottom: 24 }}>
          {activeTables.map((table) => (
            <button
              key={table.id}
              onClick={() => { setSelectedTableId(table.id); setError(null); }}
              style={{
                padding: "16px 8px",
                borderRadius: 10,
                border: `2px solid ${selectedTableId === table.id ? C.accent : C.border}`,
                background: selectedTableId === table.id ? C.accentLight : C.surface,
                cursor: "pointer",
                fontFamily: font.body,
                fontSize: 13,
                fontWeight: selectedTableId === table.id ? 600 : 400,
                color: C.text,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>
                {table.tableNumber}
              </div>
              <div style={{ color: C.muted, marginTop: 4 }}>
                {table.capacity} seats
              </div>
            </button>
          ))}
        </div>
      )}

      <Btn onClick={handleConfirm} disabled={!selectedTableId}>
        Confirm Table
      </Btn>
    </div>
  );
}