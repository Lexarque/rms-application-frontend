import React, { useState } from "react";
import { C, font } from "../theme/tokens";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Table } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Btn } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";

// Define strict literal types for the statuses
type OrderStatus = "Completed" | "In Kitchen" | "Pending";

// Ensure this matches the colors available in your Badge component
type BadgeColor = "success" | "warning" | "info" | "danger" | "default" | "gold";

interface Order {
  id: string;
  table: string;
  items: string;
  total: string;
  status: OrderStatus;
}

export default function OrdersPage() {
  const [showModal, setShowModal] = useState<boolean>(false);
  
  // Strictly type the state as an array of Order objects
  const [orders] = useState<Order[]>([
    {
      id: "#1042",
      table: "Table 5",
      items: "Nasi Goreng, Teh Tarik",
      total: "RM 18.50",
      status: "Completed",
    },
    {
      id: "#1041",
      table: "Table 2",
      items: "Grilled Chicken, Juice",
      total: "RM 32.00",
      status: "In Kitchen",
    },
    {
      id: "#1040",
      table: "Table 8",
      items: "Laksa, Roti Canai",
      total: "RM 22.00",
      status: "Pending",
    },
  ]);

  // Record strictly enforces that every possible OrderStatus has a corresponding BadgeColor mapped to it
  const statusColor: Record<OrderStatus, BadgeColor> = {
    "Completed": "success",
    "In Kitchen": "warning",
    "Pending": "info",
  };

  return (
    <div>
      <SectionHeader
        title="Orders"
        subtitle="Manage and track all customer orders"
        action={<Btn onClick={() => setShowModal(true)}>+ New Order</Btn>}
      />
      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
        }}
      >
        <Table
          columns={["Order #", "Table", "Items", "Total", "Status"]}
          rows={orders.map((o) => [
            o.id,
            o.table,
            o.items,
            o.total,
            <Badge label={o.status} color={statusColor[o.status]} />,
          ])}
        />
      </div>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="New Order"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Table Number" placeholder="e.g. Table 3" />
          <Input label="Items" placeholder="Comma-separated menu items" />
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <Btn variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={() => setShowModal(false)}>Place Order</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}