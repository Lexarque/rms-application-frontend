import React from "react";
import { C, font } from "../../../theme/tokens";
import type { OrderStatus, OrderType } from "~/types/order";

interface Props {
  value: string;
  onChange: (val: string) => void;
  status: OrderStatus | undefined;
  onStatusChange: (val: OrderStatus | undefined) => void;
  type: OrderType | undefined;
  onTypeChange: (val: OrderType | undefined) => void;
}

const STATUSES: OrderStatus[] = [
  "DRAFT",
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "SERVED",
  "COMPLETED",
  "CANCELLED",
];

const TYPES: OrderType[] = ["DINE_IN", "RESERVATION"];

export const OrderFilters: React.FC<Props> = ({
  value,
  onChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
}) => (
  <div style={{ marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
    <input
      type="text"
      placeholder="Search by order number..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        width: "100%",
        maxWidth: 340,
        fontFamily: font.body,
        color: "#333",
      }}
    />
    <select
      value={status ?? ""}
      onChange={(e) => onStatusChange((e.target.value || undefined) as OrderStatus | undefined)}
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        fontFamily: font.body,
        color: "#333",
      }}
    >
      <option value="">All statuses</option>
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
    <select
      value={type ?? ""}
      onChange={(e) => onTypeChange((e.target.value || undefined) as OrderType | undefined)}
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        fontFamily: font.body,
        color: "#333",
      }}
    >
      <option value="">All types</option>
      {TYPES.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  </div>
);