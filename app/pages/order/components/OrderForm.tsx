import React from "react";
import { C, font } from "~/theme/tokens";
import { Btn } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { MenuItemPicker } from "./MenuItemPicker";
import { useMenuItemsForOrder } from "~/hooks/useMenuItemsForOrder";
import { useRestaurantTables } from "~/hooks/useRestaurantTables";
import type { CreateOrderItemRequest, OrderType } from "~/types/order";

export interface OrderFormValues {
  type: OrderType;
  tableId: string;
  specialRequests: string;
  items: CreateOrderItemRequest[];
}

interface Props {
  initialValues: OrderFormValues;
  onSubmit: (values: OrderFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
  showTypeAndTable?: boolean;
}

export const OrderForm: React.FC<Props> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  showTypeAndTable = true,
}) => {
  const [type, setType] = React.useState<OrderType>(initialValues.type);
  const [tableId, setTableId] = React.useState(initialValues.tableId);
  const [specialRequests, setSpecialRequests] = React.useState(initialValues.specialRequests);
  const [items, setItems] = React.useState<CreateOrderItemRequest[]>(initialValues.items);

  const { data: menuItems = [], isLoading: menuLoading } = useMenuItemsForOrder();
  const { data: tables = [], isLoading: tablesLoading } = useRestaurantTables();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type, tableId, specialRequests, items });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      {showTypeAndTable && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div>
            <label style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>
              Order Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OrderType)}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                fontFamily: font.body,
                color: "#333",
                minWidth: 180,
              }}
            >
              <option value="DINE_IN">Dine-in</option>
              <option value="RESERVATION">Reservation</option>
            </select>
          </div>

          <div>
            <label style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>
              Table
            </label>
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              disabled={tablesLoading}
              required
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                fontFamily: font.body,
                color: "#333",
                minWidth: 180,
              }}
            >
              <option value="">Select a table...</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id} disabled={!table.isActive}>
                  Table {table.tableNumber} (seats {table.capacity})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <Input
        label="Special requests"
        value={specialRequests}
        onChange={(e) => setSpecialRequests(e.target.value)}
        placeholder="Allergies, preferences, etc."
      />

      <div>
        <label style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>
          Items
        </label>
        {menuLoading ? (
          <p style={{ fontFamily: font.body, fontSize: 13, color: C.muted }}>Loading menu...</p>
        ) : (
          <MenuItemPicker menuItems={menuItems} selectedItems={items} onChange={setItems} />
        )}
      </div>

      <div>
        <Btn type="submit" disabled={isSubmitting || !tableId}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Btn>
      </div>
    </form>
  );
};