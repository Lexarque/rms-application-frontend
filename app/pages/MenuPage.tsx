import React, { useEffect, useState } from "react";
import { C, font } from "../theme/tokens";
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
  addMenuIngredient,
  deleteMenuIngredient,
  type MenuCategory,
} from "../queries/menu/menuApi";
import { useInventoryItems } from "../hooks/useInventoryItems";

import { CATEGORY_ICONS, CATEGORY_LABELS } from "~/queries/menu/menuApi";

type MenuStatus = "AVAILABLE" | "UNAVAILABLE";

interface MenuItem {
  id: string;
  itemName: string;
  description?: string;
  price: number;
  category: MenuCategory;
  imageUrl?: string;
  isAvailable: boolean;
}

interface MenuIngredient {
  id: string;
  inventoryId: string;
  inventoryItemName: string;
  quantityRequired: number;
  availableQuantity: number;
  sufficient: boolean;
}

type Draft = {
  itemName: string;
  description: string;
  price: number;
  category: MenuCategory;
  imageUrl: string;
  isAvailable: boolean;
};

const EMPTY_DRAFT: Draft = {
  itemName: "",
  description: "",
  price: 0,
  category: "FOOD",
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

  // Ingredient picker state (used inside the create/edit modal)
  const { data: inventoryItems = [] } = useInventoryItems();
  const [pendingIngredients, setPendingIngredients] = useState<{
    inventoryId: string;
    inventoryItemName: string;
    quantityRequired: number;
  }[]>([]);
  const [ingredientPick, setIngredientPick] = useState("");
  const [ingredientQty, setIngredientQty] = useState(1);

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMenuItems();
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

  /* ================= INGREDIENT PICKER (within modal) ================= */
  const addPendingIngredient = () => {
    if (!ingredientPick || ingredientQty <= 0) return;
    const inv = inventoryItems.find((i) => i.id === ingredientPick);
    if (!inv) return;

    if (pendingIngredients.some((p) => p.inventoryId === ingredientPick)) {
      setErrorMessage("This ingredient is already added.");
      return;
    }

    setPendingIngredients((prev) => [
      ...prev,
      {
        inventoryId: inv.id,
        inventoryItemName: inv.itemName,
        quantityRequired: ingredientQty,
      },
    ]);
    setIngredientPick("");
    setIngredientQty(1);
    setErrorMessage("");
  };

  const removePendingIngredient = (inventoryId: string) => {
    setPendingIngredients((prev) =>
      prev.filter((p) => p.inventoryId !== inventoryId),
    );
  };

  /* ================= SAVE ================= */
  const saveItem = async () => {
    if (!draft.itemName?.trim()) {
      setErrorMessage("Item name is required.");
      return;
    }

    try {
      let savedItem: MenuItem;

      if (draftMode === "add") {
        savedItem = await createMenuItem({
          itemName: draft.itemName,
          description: draft.description,
          price: draft.price,
          category: draft.category,
          imageUrl: draft.imageUrl,
          isAvailable: draft.isAvailable,
        });

        setItems((prev) => [savedItem, ...prev]);
        setSelectedId(savedItem.id);
      } else if (selectedItem) {
        savedItem = await updateMenuItem(selectedItem.id, {
          itemName: draft.itemName,
          description: draft.description,
          price: draft.price,
          category: draft.category,
          imageUrl: draft.imageUrl,
          isAvailable: draft.isAvailable,
        });

        setItems((prev) =>
          prev.map((i) => (i.id === selectedItem.id ? savedItem : i)),
        );
      } else {
        return;
      }

      // Persist any newly-added ingredients (add mode only;
      // edit mode ingredients are managed via the Ingredients modal instead)
      if (draftMode === "add" && pendingIngredients.length > 0) {
        for (const ing of pendingIngredients) {
          try {
            await addMenuIngredient(savedItem.id, {
              inventoryId: ing.inventoryId,
              quantityRequired: ing.quantityRequired,
            });
          } catch {
            // continue attempting the rest even if one fails
          }
        }
      }

      setShowModal(false);
      setDraft(EMPTY_DRAFT);
      setPendingIngredients([]);
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

  /* ================= INGREDIENTS (view/manage existing item) ================= */
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

  const removeIngredient = async (ingredientId: string) => {
    if (!selectedId) return;
    try {
      await deleteMenuIngredient(selectedId, ingredientId);
      setIngredients((prev) => prev.filter((i) => i.id !== ingredientId));
    } catch {
      setErrorMessage("Failed to remove ingredient.");
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
              setPendingIngredients([]);
              setShowModal(true);
            }}
          >
            + Add Item
          </Btn>
        }
      />

      {errorMessage && (
        <div style={{ color: "red", marginBottom: 12 }}>{errorMessage}</div>
      )}

      {/* ================= CARDS ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
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
            <div style={{ height: 180, background: "#eee" }}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.itemName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
              <h3 style={{ margin: 0, color: C.text }}>
                {item.itemName || "Unnamed Item"}
              </h3>

              <p style={{ fontSize: 13, color: "#666" }}>
                {item.description || "No description"}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <strong style={{ color: C.text }}>
                  RM {item.price.toFixed(2)}
                </strong>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: font.body,
                      fontSize: 11,
                      color: C.muted,
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      padding: "2px 8px",
                    }}
                  >
                    {CATEGORY_ICONS[item.category ?? "FOOD"]}{" "}
                    {CATEGORY_LABELS[item.category ?? "FOOD"]}
                  </span>
                  <Badge
                    label={statusOf(item)}
                    color={item.isAvailable ? "success" : "danger"}
                  />
                </div>
              </div>

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
                      description: item.description ?? "",
                      price: item.price,
                      category: item.category,
                      imageUrl: item.imageUrl ?? "",
                      isAvailable: item.isAvailable,
                    });
                    setPendingIngredients([]);
                    setShowModal(true);
                  }}
                >
                  Edit
                </Btn>

                <Btn
                  size="sm"
                  variant="danger"
                  onClick={() => deleteItem(item.id)}
                >
                  Delete
                </Btn>

                <Btn size="sm" onClick={() => openIngredients(item.id)}>
                  Ingredients
                </Btn>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= CREATE / EDIT MODAL ================= */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={draftMode === "add" ? "Create Menu Item" : "Edit Menu Item"}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <Input
            label="Item Name *"
            value={draft.itemName}
            onChange={(e) =>
              setDraft((p) => ({ ...p, itemName: e.target.value }))
            }
          />

          <Input
            label="Description"
            value={draft.description}
            onChange={(e) =>
              setDraft((p) => ({ ...p, description: e.target.value }))
            }
          />

          <Input
            label="Price *"
            type="number"
            value={draft.price}
            onChange={(e) =>
              setDraft((p) => ({ ...p, price: Number(e.target.value) }))
            }
          />

          <div>
            <label
              style={{
                fontFamily: font.body,
                fontSize: 13,
                fontWeight: 500,
                display: "block",
                marginBottom: 6,
                color: C.text,
              }}
            >
              Category
            </label>
            <select
              value={draft.category}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  category: e.target.value as MenuCategory,
                }))
              }
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                fontFamily: font.body,
                fontSize: 13,
                color: C.text,
                background: C.surface,
              }}
            >
              <option value="FOOD">🍛 Food</option>
              <option value="BEVERAGE">🥤 Beverage</option>
              <option value="DESSERT">🍰 Dessert</option>
              <option value="SNACK">🍟 Snack</option>
              <option value="SET_MEAL">🍱 Set Meal</option>
              <option value="SEASONAL">🌿 Seasonal</option>
            </select>
          </div>

          <Input
            label="Image URL"
            value={draft.imageUrl}
            onChange={(e) =>
              setDraft((p) => ({ ...p, imageUrl: e.target.value }))
            }
          />

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
                setDraft((p) => ({ ...p, isAvailable: e.target.checked }))
              }
            />
            <label style={{ fontWeight: 500, color: "#333" }}>
              Is Available?
            </label>
          </div>

          {/* ===== Ingredient picker — add mode only ===== */}
          {draftMode === "add" && (
            <div
              style={{
                marginTop: 8,
                paddingTop: 14,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <label
                style={{
                  fontFamily: font.body,
                  fontSize: 13,
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 8,
                  color: C.text,
                }}
              >
                Ingredients (optional)
              </label>

              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select
                  value={ingredientPick}
                  onChange={(e) => setIngredientPick(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    fontFamily: font.body,
                    fontSize: 13,
                    color: C.text,
                    background: C.surface,
                  }}
                >
                  <option value="">Select inventory item...</option>
                  {inventoryItems
                    .filter(
                      (inv) =>
                        !pendingIngredients.some(
                          (p) => p.inventoryId === inv.id,
                        ),
                    )
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.itemName} (stock: {inv.quantity})
                      </option>
                    ))}
                </select>

                <input
                  type="number"
                  min={1}
                  value={ingredientQty}
                  onChange={(e) => setIngredientQty(Number(e.target.value))}
                  style={{
                    width: 70,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    fontFamily: font.body,
                    fontSize: 13,
                    color: C.text,
                  }}
                />

                <Btn size="sm" variant="ghost" onClick={addPendingIngredient}>
                  Add
                </Btn>
              </div>

              {pendingIngredients.length === 0 ? (
                <p
                  style={{
                    fontFamily: font.body,
                    fontSize: 12,
                    color: C.muted,
                  }}
                >
                  No ingredients added — item will always show as available.
                </p>
              ) : (
                <div style={{ display: "grid", gap: 6 }}>
                  {pendingIngredients.map((ing) => (
                    <div
                      key={ing.inventoryId}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: 8,
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        fontFamily: font.body,
                        fontSize: 12,
                        color: C.text,
                      }}
                    >
                      <span>
                        {ing.inventoryItemName} × {ing.quantityRequired}
                      </span>
                      <button
                        onClick={() => removePendingIngredient(ing.inventoryId)}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: C.danger,
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {draftMode === "edit" && (
            <p
              style={{
                fontFamily: font.body,
                fontSize: 12,
                color: C.muted,
                marginTop: 4,
              }}
            >
              Use the "Ingredients" button on the card to manage ingredients for
              existing items.
            </p>
          )}

          <Btn onClick={saveItem}>
            {draftMode === "add" ? "Create" : "Update"}
          </Btn>
        </div>
      </Modal>

      {/* ================= INGREDIENTS MODAL (existing items) ================= */}
      <Modal
        open={showIngredientsModal}
        onClose={() => setShowIngredientsModal(false)}
        title="Ingredients"
      >
        {ingredients.length === 0 ? (
          <div style={{ fontFamily: font.body, fontSize: 13, color: C.muted }}>
            No ingredients
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {ingredients.map((i) => (
              <div
                key={i.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  fontFamily: font.body,
                  fontSize: 13,
                  color: C.text,
                }}
              >
                <span>
                  {i.inventoryItemName} — needs {i.quantityRequired} (
                  {i.sufficient
                    ? "in stock"
                    : `only ${i.availableQuantity} left`}
                  )
                </span>
                <button
                  onClick={() => removeIngredient(i.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: C.danger,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
