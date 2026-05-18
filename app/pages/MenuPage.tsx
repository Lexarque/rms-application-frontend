import React, { useEffect, useState } from "react";
import { C } from "../theme/tokens";
import { SectionHeader } from "../components/ui/SectionHeader";
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
  itemName: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

interface MenuIngredient {
  id: string;
  inventory_itemName: string;
  quantity_required: number;
}

type Draft = {
  itemName: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
};

const EMPTY_DRAFT: Draft = {
  itemName: "",
  description: "",
  price: 0,
  imageUrl: "",
  isAvailable: true,
};

function statusOf(item: MenuItem): MenuStatus {
  return item?.isAvailable ? "AVAILABLE" : "UNAVAILABLE";
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const [showModal, setShowModal] = useState(false);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);

  const [ingredients, setIngredients] = useState<MenuIngredient[]>([]);
  const [draftMode, setDraftMode] = useState<"add" | "edit">("add");

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedItem =
    items.find((i) => i.id === selectedId) ?? null;

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMenuItems();

        // Defensive fix: ensure array
        if (Array.isArray(data)) {
          setItems(data);
          setSelectedId(data[0]?.id ?? "");
        } else {
          setItems([]);
        }
      } catch {
        setErrorMessage("Failed to load menu items.");
      }
    };

    void load();
  }, []);

  /* ================= SAVE ================= */
  const saveItem = async () => {
    if (!draft.itemName?.trim()) {
      setErrorMessage("Item name is required.");
      return;
    }

    try {
      if (draftMode === "add") {
        const created = await createMenuItem({
          itemName: draft.itemName,
          description: draft.description,
          price: draft.price,
          imageUrl: draft.imageUrl,
          isAvailable: draft.isAvailable,
        });

        setItems((prev) => [created, ...prev]);
        setSelectedId(created.id);
      } else if (selectedItem) {
        const updated = await updateMenuItem(selectedItem.id, {
          itemName: draft.itemName,
          description: draft.description,
          price: draft.price,
          imageUrl: draft.imageUrl,
          isAvailable: draft.isAvailable,
        });

        setItems((prev) =>
          prev.map((i) =>
            i.id === selectedItem.id ? updated : i
          )
        );
      }

      setShowModal(false);
      setDraft(EMPTY_DRAFT);
      setErrorMessage("");
    } catch {
      setErrorMessage("Failed to save menu item.");
    }
  };

  /* ================= DELETE ================= */
  const deleteItem = async (id: string) => {
    try {
      await deleteMenuItem(id);

      const remaining = items.filter((i) => i.id !== id);
      setItems(remaining);

      if (selectedId === id) {
        setSelectedId(remaining[0]?.id ?? "");
      }
    } catch {
      setErrorMessage("Failed to delete item.");
    }
  };

  /* ================= INGREDIENTS ================= */
  const openIngredients = async (id: string) => {
    try {
      setSelectedId(id);

      const data = await fetchMenuIngredients(id);

      setIngredients(Array.isArray(data) ? data : []);
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

      {errorMessage && (
        <div style={{ color: "red", marginBottom: 12 }}>
          {errorMessage}
        </div>
      )}

      {/* ================= CARDS ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* IMAGE */}
            <div style={{ height: 180, background: "#eee" }}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.itemName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                  }}
                >
                  No Image
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div style={{ padding: 14, flex: 1 }}>
              <h3 style={{ margin: 0 }}>
                {item.itemName || "Unnamed Item"}
              </h3>

              <p style={{ fontSize: 13, color: "#666" }}>
                {item.description || "No description"}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <strong>RM {item.price.toFixed(2)}</strong>

                <Badge
                  label={statusOf(item)}
                  color={
                    item.isAvailable ? "success" : "danger"
                  }
                />
              </div>

              {/* BUTTONS */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 14,
                  flexWrap: "wrap",
                }}
              >
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedId(item.id);
                    setDraftMode("edit");
                    setDraft({
                      itemName: item.itemName,
                      description:
                        item.description ?? "",
                      price: item.price,
                      imageUrl:
                        item.imageUrl ?? "",
                      isAvailable:
                        item.isAvailable,
                    });
                    setShowModal(true);
                  }}
                >
                  Edit
                </Btn>

                <Btn
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    deleteItem(item.id)
                  }
                >
                  Delete
                </Btn>

                <Btn
                  size="sm"
                  onClick={() =>
                    openIngredients(item.id)
                  }
                >
                  Ingredients
                </Btn>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={
          draftMode === "add"
            ? "Create Menu Item"
            : "Edit Menu Item"
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <Input
            label="Item Name *"
            value={draft.itemName}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                itemName: e.target.value,
              }))
            }
          />

          <Input
            label="Description"
            value={draft.description}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                description: e.target.value,
              }))
            }
          />

          <Input
            label="Price *"
            type="number"
            value={draft.price}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                price: Number(e.target.value),
              }))
            }
          />

          <Input
            label="Image URL"
            value={draft.imageUrl}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                imageUrl: e.target.value,
              }))
            }
          />

          {/* FIXED: ALWAYS VISIBLE HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 6,
            }}
          >
            <input
              type="checkbox"
              checked={draft.isAvailable}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  isAvailable: e.target.checked,
                }))
              }
            />
            <label style={{ fontWeight: 500 }}>
              Available (Menu Status)
            </label>
          </div>

          <Btn onClick={saveItem}>
            {draftMode === "add"
              ? "Create"
              : "Update"}
          </Btn>
        </div>
      </Modal>

      {/* ================= INGREDIENTS ================= */}
      <Modal
        open={showIngredientsModal}
        onClose={() =>
          setShowIngredientsModal(false)
        }
        title="Ingredients"
      >
        {ingredients.length === 0 ? (
          <div>No ingredients</div>
        ) : (
          ingredients.map((i) => (
            <div key={i.id}>
              {i.inventory_itemName} —{" "}
              {i.quantity_required}
            </div>
          ))
        )}
      </Modal>
    </div>
  );
}