import React, { useState } from "react";
import { C, font } from "~/theme/tokens";
import { Btn } from "~/components/ui/Button";
import type { MenuItem, MenuCategory } from "~/queries/menu/menuApi";
import { CATEGORY_ICONS, CATEGORY_LABELS, MENU_CATEGORIES } from "~/queries/menu/menuApi";
import type { CreateOrderItemRequest } from "~/types/order";
import { formatCurrency } from "../utils";

interface Props {
  menuItems: MenuItem[];
  selectedItems: CreateOrderItemRequest[];
  onChange: (items: CreateOrderItemRequest[]) => void;
}

export const MenuItemPicker: React.FC<Props> = ({ menuItems, selectedItems, onChange }) => {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "ALL">("ALL");

  const getSelected = (menuItemId: string) =>
    selectedItems.find((i) => i.menuItemId === menuItemId);

  const addItem = (menuItemId: string) => {
    const existing = getSelected(menuItemId);
    if (existing) {
      onChange(selectedItems.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      onChange([...selectedItems, { menuItemId, quantity: 1, customInstructions: "" }]);
    }
  };

  const decrementItem = (menuItemId: string) => {
    const existing = getSelected(menuItemId);
    if (!existing) return;
    if (existing.quantity <= 1) {
      onChange(selectedItems.filter((i) => i.menuItemId !== menuItemId));
    } else {
      onChange(selectedItems.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i
      ));
    }
  };

  const removeItem = (menuItemId: string) => {
    onChange(selectedItems.filter((i) => i.menuItemId !== menuItemId));
  };

  const total = selectedItems.reduce((sum, item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
    return sum + (menuItem ? menuItem.price * item.quantity : 0);
  }, 0);

  const filteredItems = activeCategory === "ALL"
    ? menuItems
    : menuItems.filter((m) => m.category === activeCategory);

  return (
    <div>
      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(["ALL", ...MENU_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: `1.5px solid ${activeCategory === cat ? C.accent : C.border}`,
              background: activeCategory === cat ? C.accentLight : C.surface,
              color: activeCategory === cat ? C.accent : C.muted,
              fontFamily: font.body,
              fontSize: 12,
              fontWeight: activeCategory === cat ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {cat === "ALL" ? "🍽 All" : `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {filteredItems.map((item) => {
          const selected = getSelected(item.id);
          const inCart = !!selected;
          const outOfStock = !item.stockAvailable;
          const unavailable = outOfStock || !item.isAvailable;

          // find the first failing ingredient for the label
          const failingIngredient = item.ingredients.find((i) => !i.sufficient);

          return (
            <div
              key={item.id}
              style={{
                background: C.surface,
                border: `2px solid ${unavailable ? C.border : inCart ? C.accent : C.border}`,
                borderRadius: 16,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.15s",
                opacity: unavailable ? 0.6 : 1,
              }}
            >
              {/* Image */}
              <div style={{ height: 150, background: "#eee", position: "relative" }}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.itemName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: unavailable ? "grayscale(60%)" : "none",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#aaa",
                      fontFamily: font.body,
                      fontSize: 13,
                    }}
                  >
                    No Image
                  </div>
                )}

                {/* Out of stock overlay badge */}
                {unavailable && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0, left: 0, right: 0, bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.35)",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(0,0,0,0.75)",
                        color: "#fff",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontFamily: font.body,
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: "center",
                        maxWidth: "80%",
                      }}
                    >
                      {outOfStock && failingIngredient
                        ? `Out of stock\n(${failingIngredient.inventoryItemName})`
                        : "Unavailable"}
                    </div>
                  </div>
                )}

                {/* In-cart badge */}
                {inCart && !unavailable && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: C.accent,
                      color: "#fff",
                      borderRadius: 20,
                      padding: "2px 10px",
                      fontFamily: font.body,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {selected.quantity} in cart
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column" }}>
                <h3
                  style={{
                    margin: "0 0 4px",
                    color: unavailable ? C.muted : C.text,
                    fontFamily: font.body,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {item.itemName}
                </h3>

                <p
                  style={{
                    fontSize: 12,
                    color: C.muted,
                    fontFamily: font.body,
                    margin: "0 0 10px",
                    flex: 1,
                    lineHeight: 1.4,
                  }}
                >
                  {item.description || "No description"}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <strong style={{ fontFamily: font.body, fontSize: 14, color: C.text }}>
                    {formatCurrency(item.price)}
                  </strong>
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
                    {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]}
                  </span>
                </div>

                {/* Ingredient shortage detail */}
                {outOfStock && failingIngredient && (
                  <p
                    style={{
                      fontFamily: font.body,
                      fontSize: 11,
                      color: C.danger,
                      margin: "0 0 8px",
                    }}
                  >
                    ⚠ {failingIngredient.inventoryItemName} — needs {failingIngredient.quantityRequired}, only {failingIngredient.availableQuantity} left
                  </p>
                )}

                {/* Add / quantity controls */}
                {unavailable ? (
                  <div
                    style={{
                      padding: "7px 0",
                      fontFamily: font.body,
                      fontSize: 12,
                      color: C.muted,
                      textAlign: "center",
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                    }}
                  >
                    Not available
                  </div>
                ) : !inCart ? (
                  <Btn size="sm" onClick={() => addItem(item.id)}>
                    + Add
                  </Btn>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => decrementItem(item.id)}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        border: `1px solid ${C.border}`, background: C.surface,
                        cursor: "pointer", fontFamily: font.body, fontSize: 16,
                        color: C.text, display: "flex", alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        fontFamily: font.body, fontSize: 14, fontWeight: 600,
                        color: C.text, minWidth: 20, textAlign: "center",
                      }}
                    >
                      {selected.quantity}
                    </span>
                    <button
                      onClick={() => addItem(item.id)}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        border: `1px solid ${C.border}`, background: C.surface,
                        cursor: "pointer", fontFamily: font.body, fontSize: 16,
                        color: C.text, display: "flex", alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                    <Btn size="sm" variant="ghost" onClick={() => removeItem(item.id)}
                      style={{ marginLeft: "auto" }}>
                      ✕
                    </Btn>
                  </div>
                )}

                {/* Custom instructions */}
                {inCart && !unavailable && (
                  <input
                    type="text"
                    placeholder="Special instructions..."
                    value={selected.customInstructions ?? ""}
                    onChange={(e) =>
                      onChange(selectedItems.map((i) =>
                        i.menuItemId === item.id
                          ? { ...i, customInstructions: e.target.value }
                          : i
                      ))
                    }
                    style={{
                      marginTop: 8, width: "100%", padding: "6px 10px",
                      borderRadius: 6, border: `1px solid ${C.border}`,
                      fontFamily: font.body, fontSize: 12, color: C.text,
                      boxSizing: "border-box",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order summary */}
      {selectedItems.length > 0 && (
        <div
          style={{
            background: C.accentLight,
            border: `1px solid ${C.accent}`,
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: font.body,
          }}
        >
          <div style={{ fontSize: 13, color: C.text }}>
            <strong>{selectedItems.reduce((sum, i) => sum + i.quantity, 0)}</strong> item(s) selected
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>
            {formatCurrency(total)}
          </div>
        </div>
      )}
    </div>
  );
};