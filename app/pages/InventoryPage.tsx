import React, { useState } from "react";
import { C } from "../theme/tokens";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Table } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Btn } from "../components/ui/Button";

// Restrict statuses to exact literal strings
type InventoryStatus = "OK" | "Low";

interface InventoryItem {
  name: string;
  unit: string;
  quantity: number;
  threshold: number;
  status: InventoryStatus;
}

export default function InventoryPage() {
  // Strongly typed state array
  const [items] = useState<InventoryItem[]>([
    {
      name: "Rice (Jasmine)",
      unit: "kg",
      quantity: 45,
      threshold: 10,
      status: "OK",
    },
    {
      name: "Chicken Breast",
      unit: "kg",
      quantity: 8,
      threshold: 10,
      status: "Low",
    },
    {
      name: "Coconut Milk",
      unit: "litre",
      quantity: 5,
      threshold: 8,
      status: "Low",
    },
    {
      name: "Cooking Oil",
      unit: "litre",
      quantity: 20,
      threshold: 5,
      status: "OK",
    },
    {
      name: "Chilli Paste",
      unit: "kg",
      quantity: 3,
      threshold: 5,
      status: "Low",
    },
  ]);

  return (
    <div>
      <SectionHeader
        title="Inventory"
        subtitle="Track and manage ingredient stock levels"
        action={<Btn>+ Restock</Btn>}
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
          columns={[
            "Ingredient",
            "Unit",
            "Quantity",
            "Min. Threshold",
            "Status",
          ]}
          rows={items.map((i) => [
            i.name,
            i.unit,
            i.quantity,
            i.threshold,
            <Badge
              label={i.status}
              color={i.status === "OK" ? "success" : "danger"}
            />,
          ])}
        />
      </div>
    </div>
  );
}