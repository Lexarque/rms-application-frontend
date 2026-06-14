import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { C, font } from "~/theme/tokens";
import { Btn } from "~/components/ui/Button";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { MenuItemPicker } from "./components/MenuItemPicker";
import { useMenuItemsForOrder } from "~/hooks/useMenuItemsForOrder";
import { useCreateOrder } from "~/hooks/useOrderMutations";
import { useOrderSession } from "~/context/OrderSessionContext";
import { useAuth } from "~/context/AuthContext";
import { STAFF_ROLES } from "~/types/role";
import type { CreateOrderItemRequest } from "~/types/order";

export default function MenuOrderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { session, clearSession } = useOrderSession();
  const { data: menuItems = [], isLoading } = useMenuItemsForOrder();
  const createOrder = useCreateOrder();

  const [items, setItems] = useState<CreateOrderItemRequest[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      const isStaff = !!user?.role && STAFF_ROLES.includes(user.role);
      navigate(isStaff ? "/order/table-staff" : "/order/table", {
        replace: true,
      });
    }
  }, [session, user, navigate]);

  if (!session) return null;

  const handleSubmit = () => {
    if (items.length === 0) {
      setError("Please add at least one item.");
      return;
    }

    setError(null);

    createOrder.mutate(
      {
        type: session.type,
        tableId: session.tableId,
        customerId: user?.id,
        specialRequests: specialRequests || undefined,
        items,
      },
      {
        onSuccess: (order) => {
          navigate(`/order/payment/${order.id}`, { replace: true });
        },
        onError: () => {
          setError("Failed to place order. Please try again.");
        },
      },
    );
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
      <SectionHeader
        title="Choose Your Items"
        subtitle={`Table ${session.tableNumber} · ${session.type === "DINE_IN" ? "Dine-in" : "Reservation"}`}
      />

      {error && (
        <p
          style={{
            color: C.danger,
            fontFamily: font.body,
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 16,
        }}
      >
        {isLoading ? (
          <p style={{ fontFamily: font.body, color: C.muted }}>
            Loading menu...
          </p>
        ) : (
          <MenuItemPicker
            menuItems={menuItems}
            selectedItems={items}
            onChange={setItems}
          />
        )}
      </div>

      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 24,
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
          Special requests
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Allergies, preferences, etc."
          rows={3}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            fontFamily: font.body,
            fontSize: 13,
            color: C.text,
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <Btn
          variant="ghost"
          onClick={() => {
            clearSession();
            navigate(-1);
          }}
        >
          Back
        </Btn>
        <Btn
          onClick={handleSubmit}
          disabled={createOrder.isPending || items.length === 0}
        >
          {createOrder.isPending ? "Placing order..." : "Place Order"}
        </Btn>
      </div>
    </div>
  );
}
