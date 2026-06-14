import React from "react";
import { C, font } from "~/theme/tokens";
import { Btn } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import type { MenuItem } from "~/queries/menu/menuApi";
import type { CreateOrderItemRequest } from "~/types/order";
import { formatCurrency } from "../utils";

interface Props {
  menuItems: MenuItem[];
  selectedItems: CreateOrderItemRequest[];
  onChange: (items: CreateOrderItemRequest[]) => void;
}

export const MenuItemPicker: React.FC<Props> = ({ menuItems, selectedItems, onChange }) => {
  const [pickerValue, setPickerValue] = React.useState("");

  const addItem = (menuItemId: string) => {
    if (!menuItemId) return;
    const existing = selectedItems.find((i) => i.menuItemId === menuItemId);
    if (existing) {
      onChange(
        selectedItems.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      onChange([...selectedItems, { menuItemId, quantity: 1, customInstructions: "" }]);
    }
    setPickerValue("");
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    onChange(
      selectedItems.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
    );
  };

  const updateInstructions = (menuItemId: string, customInstructions: string) => {
    onChange(
      selectedItems.map((i) =>
        i.menuItemId === menuItemId ? { ...i, customInstructions } : i
      )
    );
  };

  const removeItem = (menuItemId: string) => {
    onChange(selectedItems.filter((i) => i.menuItemId !== menuItemId));
  };

  const getMenuItem = (id: string) => menuItems.find((m) => m.id === id);

  const total = selectedItems.reduce((sum, item) => {
    const menuItem = getMenuItem(item.menuItemId);
    return sum + (menuItem ? menuItem.price * item.quantity : 0);
  }, 0);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <select
          value={pickerValue}
          onChange={(e) => addItem(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            fontFamily: font.body,
            color: "#333",
            width: "100%",
            maxWidth: 340,
          }}
        >
          <option value="">+ Add menu item...</option>
          {menuItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.itemName} — {formatCurrency(item.price)}
            </option>
          ))}
        </select>
      </div>

      {selectedItems.length === 0 ? (
        <p style={{ fontFamily: font.body, fontSize: 13, color: C.muted }}>No items added yet.</p>
      ) : (
        <table style={{ width: "100%", fontFamily: font.body, fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: C.muted }}>
              <th style={{ paddingBottom: 8 }}>Item</th>
              <th style={{ paddingBottom: 8, width: 90 }}>Qty</th>
              <th style={{ paddingBottom: 8, width: 100 }}>Price</th>
              <th style={{ paddingBottom: 8 }}>Notes</th>
              <th style={{ paddingBottom: 8, width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item) => {
              const menuItem = getMenuItem(item.menuItemId);
              return (
                <tr key={item.menuItemId} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "8px 0" }}>{menuItem?.itemName ?? "Unknown item"}</td>
                  <td style={{ padding: "8px 0" }}>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.menuItemId, Number(e.target.value))}
                      style={{
                        width: 60,
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: `1px solid ${C.border}`,
                        fontFamily: font.body,
                      }}
                    />
                  </td>
                  <td style={{ padding: "8px 0" }}>
                    {menuItem ? formatCurrency(menuItem.price * item.quantity) : "-"}
                  </td>
                  <td style={{ padding: "8px 0" }}>
                    <input
                      type="text"
                      placeholder="e.g. no onions"
                      value={item.customInstructions ?? ""}
                      onChange={(e) => updateInstructions(item.menuItemId, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: `1px solid ${C.border}`,
                        fontFamily: font.body,
                      }}
                    />
                  </td>
                  <td style={{ padding: "8px 0" }}>
                    <Btn variant="ghost" size="sm" onClick={() => removeItem(item.menuItemId)}>
                      ✕
                    </Btn>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `1px solid ${C.border}`, fontWeight: 500 }}>
              <td style={{ padding: "8px 0" }} colSpan={2}>
                Total
              </td>
              <td style={{ padding: "8px 0" }}>{formatCurrency(total)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};