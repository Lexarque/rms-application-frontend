import React, { useState } from "react";
import { C } from "../theme/tokens";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Table } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Btn } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";

// Restrict statuses to exact literal strings
type MenuStatus = "Available" | "Out of Stock";

interface MenuItem {
  name: string;
  category: string;
  price: string;
  status: MenuStatus;
}

export default function MenuPage() {
  const [showModal, setShowModal] = useState<boolean>(false);
  
  // Strictly type the state as an array of MenuItem objects
  const [items] = useState<MenuItem[]>([
    {
      name: "Nasi Goreng Kampung",
      category: "Main",
      price: "RM 12.00",
      status: "Available",
    },
    {
      name: "Laksa Terengganu",
      category: "Main",
      price: "RM 10.50",
      status: "Available",
    },
    {
      name: "Grilled Chicken Chop",
      category: "Western",
      price: "RM 22.00",
      status: "Available",
    },
    {
      name: "Roti Canai",
      category: "Snacks",
      price: "RM 3.00",
      status: "Available",
    },
    {
      name: "Teh Tarik",
      category: "Drinks",
      price: "RM 3.50",
      status: "Out of Stock",
    },
  ]);

  return (
    <div>
      <SectionHeader
        title="Menu Management"
        subtitle="Add, edit, and manage menu items"
        action={<Btn onClick={() => setShowModal(true)}>+ Add Item</Btn>}
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
          columns={["Name", "Category", "Price", "Status", "Actions"]}
          rows={items.map((i) => [
            i.name,
            i.category,
            i.price,
            <Badge
              label={i.status}
              color={i.status === "Available" ? "success" : "danger"}
            />,
            <Btn variant="ghost" size="sm">
              Edit
            </Btn>,
          ])}
        />
      </div>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add Menu Item"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Item Name" placeholder="e.g. Nasi Lemak" required />
          <Input
            label="Category"
            placeholder="e.g. Main, Drinks, Snacks"
            required
          />
          <Input label="Price (RM)" type="number" placeholder="0.00" required />
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
            <Btn onClick={() => setShowModal(false)}>Save Item</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}