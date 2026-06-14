import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useOrder } from "~/hooks/useOrder";
import { useProcessPayment } from "~/hooks/usePayment";
import { C, font } from "~/theme/tokens";
import { Btn } from "~/components/ui/Button";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { formatCurrency } from "./utils";
import type { PaymentMethod } from "~/types/payment";
import { useOrderSession } from "~/context/OrderSessionContext";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isPending: orderLoading } = useOrder(id);
  const processPayment = useProcessPayment(id ?? "");
  const { clearSession } = useOrderSession();

  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [cashTendered, setCashTendered] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (orderLoading) {
    return (
      <p style={{ fontFamily: font.body, padding: 40 }}>Loading order...</p>
    );
  }

  if (!order) {
    return (
      <p style={{ fontFamily: font.body, color: C.danger, padding: 40 }}>
        Order not found.
      </p>
    );
  }

  const total = order.totalAmount ?? 0;
  const tendered = parseFloat(cashTendered) || 0;
  const change = method === "CASH" ? tendered - total : 0;
  const cashValid = method === "CASH" ? tendered >= total : true;

  const handlePay = () => {
    setError(null);
    processPayment.mutate(
      {
        method,
        cashTendered: method === "CASH" ? tendered : undefined,
      },
      {
        onSuccess: () => {
          clearSession(); // ✅ Clear it here, right before heading to the Thank You page
          navigate(`/order/thankyou/${id}`, { replace: true });
        },
        onError: (err: any) => {
          // ...
        },
      },
    );
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
      <SectionHeader
        title="Payment"
        subtitle={`Order #${order.orderNumber} · Table ${order.tableNumber}`}
      />

      {/* Order summary */}
      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 16,
        }}
      >
        <p
          style={{
            fontFamily: font.body,
            fontSize: 13,
            color: C.muted,
            marginBottom: 12,
          }}
        >
          Order summary
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
            <span>
              {item.menuItemName} × {item.quantity}
            </span>
            <span>{formatCurrency(item.priceAtOrder * item.quantity)}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: font.body,
            fontSize: 15,
            fontWeight: 700,
            padding: "12px 0 0",
            marginTop: 4,
            borderTop: `2px solid ${C.border}`,
            color: C.text,
          }}
        >
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Payment method toggle */}
      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 16,
        }}
      >
        <p
          style={{
            fontFamily: font.body,
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 12,
            color: C.text,
          }}
        >
          Payment method
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          {(["CASH", "CARD"] as PaymentMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMethod(m);
                setCashTendered("");
                setError(null);
              }}
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: 10,
                border: `2px solid ${method === m ? C.accent : C.border}`,
                background: method === m ? C.accentLight : C.surface,
                cursor: "pointer",
                fontFamily: font.body,
                fontSize: 14,
                fontWeight: method === m ? 600 : 400,
                color: method === m ? C.accent : C.muted,
              }}
            >
              {m === "CASH" ? "💵 Cash" : "💳 Card"}
            </button>
          ))}
        </div>

        {/* Cash tendered input */}
        {method === "CASH" && (
          <div style={{ marginTop: 16 }}>
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
              Cash tendered
            </label>
            <input
              type="number"
              min={total}
              step="0.01"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              placeholder={`Minimum ${formatCurrency(total)}`}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                fontFamily: font.body,
                fontSize: 14,
                color: C.text,
                boxSizing: "border-box",
              }}
            />
            {tendered > 0 && cashValid && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: C.accentLight,
                  fontFamily: font.body,
                  fontSize: 14,
                  color: C.accent,
                  fontWeight: 600,
                }}
              >
                Change: {formatCurrency(change)}
              </div>
            )}
            {tendered > 0 && !cashValid && (
              <p
                style={{
                  fontFamily: font.body,
                  fontSize: 13,
                  color: C.danger,
                  marginTop: 8,
                }}
              >
                Amount is less than total.
              </p>
            )}
          </div>
        )}

        {/* Card confirmation */}
        {method === "CARD" && (
          <div
            style={{
              marginTop: 16,
              padding: "14px",
              borderRadius: 8,
              background: C.bg,
              border: `1px solid ${C.border}`,
              fontFamily: font.body,
              fontSize: 13,
              color: C.muted,
              textAlign: "center",
            }}
          >
            Present card to terminal and confirm payment
          </div>
        )}
      </div>

      {error && (
        <p
          style={{
            fontFamily: font.body,
            fontSize: 13,
            color: C.danger,
            marginBottom: 12,
          }}
        >
          {error}
        </p>
      )}

      <Btn
        onClick={handlePay}
        disabled={processPayment.isPending || (method === "CASH" && !cashValid)}
      >
        {processPayment.isPending
          ? "Processing..."
          : `Confirm Payment · ${formatCurrency(total)}`}
      </Btn>
    </div>
  );
}
