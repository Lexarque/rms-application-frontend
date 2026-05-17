import React, { useEffect, useState } from "react";
import { C } from "../theme/tokens";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Table } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Btn } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";

import {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  fetchMenuIngredients,
} from "../queries/menu/menuApi";

type MenuStatus = "AVAILABLE" | "UNAVAILABLE";

interface MenuItem {
  id: string;
  item_name: string;
  category?: string;
  price: number;
  is_available: boolean;
}

interface MenuIngredient {
  id: string;
  inventory_item_name: string;
  quantity_required: number;
}

const EMPTY_DRAFT = {
  item_name: "",
  category: "",
  price: 0,
};

function statusOf(item: MenuItem): MenuStatus {
  return item.is_available ? "AVAILABLE" : "UNAVAILABLE";
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const [showModal, setShowModal] = useState(false);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);

  const [ingredients, setIngredients] = useState<MenuIngredient[]>([]);

  const [draftMode, setDraftMode] = useState<"add" | "edit">("add");
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const [errorMessage, setErrorMessage] = useState("");

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMenuItems();
        setItems(data);
        setSelectedId(data[0]?.id ?? "");
      } catch {
        setErrorMessage("Failed to load menu items.");
      }
    };
    void load();
  }, []);

  /* ================= SAVE ================= */
  const saveItem = async () => {
    if (!draft.item_name.trim()) return;

    try {
      if (draftMode === "add") {
        const created = await createMenuItem(draft);
        setItems((prev) => [created, ...prev]);
        setSelectedId(created.id);
      } else if (selectedItem) {
        const updated = await updateMenuItem(selectedItem.id, draft);
        setItems((prev) =>
          prev.map((i) => (i.id === selectedItem.id ? updated : i))
        );
      }

      setShowModal(false);
      setDraft(EMPTY_DRAFT);
    } catch {
      setErrorMessage("Failed to save menu item.");
    }
  };

  /* ================= DELETE ================= */
  const deleteItem = async () => {
    if (!selectedItem) return;

    try {
      await deleteMenuItem(selectedItem.id);

      const remaining = items.filter((i) => i.id !== selectedItem.id);
      setItems(remaining);
      setSelectedId(remaining[0]?.id ?? "");
    } catch {
      setErrorMessage("Failed to delete item.");
    }
  };

  /* ================= INGREDIENTS ================= */
  const openIngredients = async () => {
    if (!selectedItem) return;

    try {
      const data = await fetchMenuIngredients(selectedItem.id);
      setIngredients(data);
      setShowIngredientsModal(true);
    } catch {
      setErrorMessage("Failed to load ingredients.");
    }
  };

  return (
    <div>
      <SectionHeader
        title="Menu Management"
        subtitle="Manage menu items and ingredients"
        action={
          <Btn
            onClick={() => {
              setDraftMode("add");
              setDraft(EMPTY_DRAFT);
              setShowModal(true);
            }}
          >
            + Add Item
          </Btn>
        }
      />

      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

      {/* TABLE */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <Table
          columns={["Name", "Price", "Status", "Actions"]}
          rows={items.map((i) => [
            i.item_name,
            `RM ${i.price.toFixed(2)}`,
            <Badge label={statusOf(i)} color={i.is_available ? "success" : "danger"} />,
            <div style={{ display: "flex", gap: 8 }}>
              <Btn size="sm" variant="ghost" onClick={() => setSelectedId(i.id)}>
                Select
              </Btn>

              <Btn
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedId(i.id);
                  setDraftMode("edit");
                  setDraft({
                    item_name: i.item_name,
                    category: i.category ?? "",
                    price: i.price,
                  });
                  setShowModal(true);
                }}
              >
                Edit
              </Btn>

              <Btn size="sm" variant="danger" onClick={deleteItem}>
                Delete
              </Btn>

              <Btn size="sm" onClick={openIngredients}>
                Ingredients
              </Btn>
            </div>,
          ])}
          onRowClick={(index) => setSelectedId(items[index].id)}
        />
      </div>

      {/* MODAL */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Menu Item">
        <div style={{ display: "grid", gap: 10 }}>
          <Input
            label="Item Name"
            value={draft.item_name}
            onChange={(e) => setDraft((p) => ({ ...p, item_name: e.target.value }))}
          />

          <Input
            label="Category"
            value={draft.category}
            onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
          />

          <Input
            label="Price"
            type="number"
            value={draft.price}
            onChange={(e) => setDraft((p) => ({ ...p, price: Number(e.target.value) }))}
          />

          <Btn onClick={saveItem}>Save</Btn>
        </div>
      </Modal>

      {/* INGREDIENTS */}
      <Modal open={showIngredientsModal} onClose={() => setShowIngredientsModal(false)} title="Ingredients">
        {ingredients.length === 0 ? (
          <div>No ingredients</div>
        ) : (
          ingredients.map((i) => (
            <div key={i.id}>
              {i.inventory_item_name} — {i.quantity_required}
            </div>
          ))
        )}
      </Modal>
    </div>
  );
}