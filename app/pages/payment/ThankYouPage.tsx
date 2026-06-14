import React from "react";
import { useNavigate, useParams } from "react-router";
import { useOrder } from "~/hooks/useOrder";
import { C, font } from "~/theme/tokens";
import { Btn } from "~/components/ui/Button";
import { formatCurrency } from "./utils";

export default function ThankYouPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order } = useOrder(id);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>

        <h1
          style={{
            fontFamily: font.display,
            fontSize: 28,
            color: C.text,
            marginBottom: 8,
          }}
        >
          Thank you!
        </h1>

        <p
          style={{
            fontFamily: font.body,
            fontSize: 14,
            color: C.muted,
            marginBottom: 28,
          }}
        >
          Your payment was received. Enjoy your meal!
        </p>

        {order && (
          <div
            style={{
              background: C.surface,
              border: `0.5px solid ${C.border}`,
              borderRadius: 14,
              padding: "20px 22px",
              marginBottom: 28,
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: font.body,
                fontSize: 13,
                marginBottom: 8,
                color: C.text,
              }}
            >
              <span style={{ color: C.muted }}>Order</span>
              <span style={{ fontWeight: 600 }}>#{order.orderNumber}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: font.body,
                fontSize: 13,
                marginBottom: 8,
                color: C.text,
              }}
            >
              <span style={{ color: C.muted }}>Table</span>
              <span>{order.tableNumber}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: font.body,
                fontSize: 13,
                color: C.text,
                paddingTop: 8,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <span style={{ color: C.muted }}>Total paid</span>
              <span style={{ fontWeight: 700, color: C.success }}>
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        )}

        <Btn onClick={() => navigate("/login", { replace: true })}>
          Done
        </Btn>
      </div>
    </div>
  );
}