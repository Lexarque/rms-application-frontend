import React from "react";
import { useNavigate, useParams } from "react-router";
import { useOrder } from "~/hooks/useOrder";
import { C, font } from "~/theme/tokens";
import { Btn } from "~/components/ui/Button";
import { formatCurrency } from "./utils";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isPending, isError } = useOrder(id);

  if (isPending) return <p style={{ fontFamily: font.body, padding: 40 }}>Loading...</p>;
  if (isError || !order) return <p style={{ fontFamily: font.body, color: C.danger, padding: 40 }}>Order not found.</p>;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>

      <h1 style={{ fontFamily: font.display, fontSize: 24, color: C.text, marginBottom: 8 }}>
        Order Placed!
      </h1>

      <p style={{ fontFamily: font.body, fontSize: 14, color: C.muted, marginBottom: 24 }}>
        Your order <strong>#{order.orderNumber}</strong> has been received and is being prepared.
      </p>

      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          textAlign: "left",
          marginBottom: 24,
        }}
      >
        <p style={{ fontFamily: font.body, fontSize: 13, margin: "0 0 8px" }}>
          <strong>Table:</strong> {order.tableNumber}
        </p>
        <p style={{ fontFamily: font.body, fontSize: 13, margin: "0 0 16px" }}>
          <strong>Total:</strong> {formatCurrency(order.totalAmount)}
        </p>

        {order.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: font.body,
              fontSize: 13,
              padding: "6px 0",
              borderTop: `1px solid ${C.border}`,
              color: C.text,
            }}
          >
            <span>{item.menuItemName} × {item.quantity}</span>
            <span>{formatCurrency(item.priceAtOrder * item.quantity)}</span>
          </div>
        ))}
      </div>

      <Btn onClick={() => navigate("/")}>Back to Home</Btn>
    </div>
  );
}