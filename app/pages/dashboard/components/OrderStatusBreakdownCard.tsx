import React from "react";
import { C, font } from "~/theme/tokens";
import { Badge } from "~/components/ui/Badge";
import type { OrderStats } from "~/types/dashboard";
import { formatStatusLabel, getStatusBadgeColor } from "../utils";

interface Props {
  orders: OrderStats;
}

export const OrderStatusBreakdownCard: React.FC<Props> = ({ orders }) => {
  const entries = Object.entries(orders.byStatus);

  return (
    <div
      style={{
        background: C.surface,
        border: `0.5px solid ${C.border}`,
        borderRadius: 14,
        padding: "20px 22px",
      }}
    >
      <h3
        style={{
          fontFamily: font.display,
          fontSize: 16,
          color: C.text,
          margin: "0 0 16px",
          fontWeight: 600,
        }}
      >
        Orders by Status
      </h3>

      {entries.length === 0 ? (
        <p style={{ fontFamily: font.body, fontSize: 13, color: C.muted }}>No orders yet.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {entries.map(([status, count]) => (
            <div
              key={status}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 10,
                background: C.bg,
                border: `1px solid ${C.border}`,
              }}
            >
              <Badge label={formatStatusLabel(status)} color={getStatusBadgeColor(status)} />
              <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.text }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};