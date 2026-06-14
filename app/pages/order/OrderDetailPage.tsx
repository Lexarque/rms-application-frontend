import React from "react";
import { useNavigate, useParams } from "react-router";
import { useOrder } from "~/hooks/useOrder";
import { useCancelOrder, useChangeOrderStatus } from "~/hooks/useOrderMutations";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Btn } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { C, font } from "~/theme/tokens";
import { formatCurrency, formatDate, getNextStatuses, getStatusColor } from "./utils";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrder(id);
  const changeStatus = useChangeOrderStatus(id ?? "");
  const cancelOrder = useCancelOrder();

  if (isLoading) return <p style={{ fontFamily: font.body }}>Loading order...</p>;
  if (isError || !order) return <p style={{ fontFamily: font.body, color: "red" }}>Order not found.</p>;

  const nextStatuses = getNextStatuses(order.status);

  return (
    <div>
      <SectionHeader
        title={`Order #${order.orderNumber}`}
        subtitle={`${order.type === "DINE_IN" ? "Dine-in" : "Reservation"} · Table ${order.tableNumber}`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => navigate(`/orders/${order.id}/edit`)}>
              Edit
            </Btn>
            {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
              <Btn
                variant="ghost"
                onClick={() => cancelOrder.mutate(order.id, { onSuccess: () => navigate("/orders") })}
              >
                Cancel Order
              </Btn>
            )}
          </div>
        }
      />

      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Badge label={order.status} color={getStatusColor(order.status)} />
          <span style={{ fontFamily: font.body, fontSize: 13, color: C.muted }}>
            {formatDate(order.createdAt)}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontFamily: font.body, fontSize: 13 }}>
          <div>
            <strong>Customer:</strong> {order.customerName ?? "-"}
          </div>
          <div>
            <strong>Staff:</strong> {order.staffName ?? "-"}
          </div>
          <div>
            <strong>Table:</strong> {order.tableNumber}
          </div>
          <div>
            <strong>Total:</strong> {formatCurrency(order.totalAmount)}
          </div>
        </div>

        {order.specialRequests && (
          <p style={{ fontFamily: font.body, fontSize: 13, marginTop: 12 }}>
            <strong>Special requests:</strong> {order.specialRequests}
          </p>
        )}
      </div>

      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontFamily: font.display, fontSize: 15, marginBottom: 12 }}>Items</h3>
        {order.items.length === 0 ? (
          <p style={{ fontFamily: font.body, fontSize: 13, color: C.muted }}>No items added.</p>
        ) : (
          <table style={{ width: "100%", fontFamily: font.body, fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: C.muted }}>
                <th style={{ paddingBottom: 8 }}>Item</th>
                <th style={{ paddingBottom: 8 }}>Qty</th>
                <th style={{ paddingBottom: 8 }}>Price</th>
                <th style={{ paddingBottom: 8 }}>Subtotal</th>
                <th style={{ paddingBottom: 8 }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "6px 0" }}>{item.menuItemName}</td>
                  <td style={{ padding: "6px 0" }}>{item.quantity}</td>
                  <td style={{ padding: "6px 0" }}>{formatCurrency(item.priceAtOrder)}</td>
                  <td style={{ padding: "6px 0" }}>{formatCurrency(item.priceAtOrder * item.quantity)}</td>
                  <td style={{ padding: "6px 0", color: C.muted }}>{item.customInstructions ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {nextStatuses.length > 0 && (
        <div
          style={{
            background: C.surface,
            border: `0.5px solid ${C.border}`,
            borderRadius: 14,
            padding: "20px 22px",
          }}
        >
          <h3 style={{ fontFamily: font.display, fontSize: 15, marginBottom: 12 }}>Update Status</h3>
          <div style={{ display: "flex", gap: 8 }}>
            {nextStatuses.map((status) => (
              <Btn key={status} onClick={() => changeStatus.mutate({ status })} disabled={changeStatus.isPending}>
                Mark as {status}
              </Btn>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}