import React from "react";
import { useNavigate, useParams } from "react-router";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { C, font } from "~/theme/tokens";
import { OrderForm, type OrderFormValues } from "./components/OrderForm";
import { useOrder } from "~/hooks/useOrder";
import { useUpdateOrder } from "~/hooks/useOrderMutations";
import { Btn } from "~/components/ui/Button";

export default function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrder(id);
  const updateOrder = useUpdateOrder(id ?? "");
  const [error, setError] = React.useState<string | null>(null);

  if (isLoading) return <p style={{ fontFamily: font.body }}>Loading order...</p>;
  if (isError || !order) return <p style={{ fontFamily: font.body, color: C.danger }}>Order not found.</p>;

  if (order.status !== "DRAFT" && order.status !== "PENDING") {
    return (
      <div>
        <SectionHeader title={`Edit Order #${order.orderNumber}`} />
        <p style={{ fontFamily: font.body, color: C.danger }}>
          This order can no longer be edited (status: {order.status}).
        </p>
        <Btn variant="ghost" onClick={() => navigate(`/orders/${order.id}`)}>
          Back to order
        </Btn>
      </div>
    );
  }

  const initialValues: OrderFormValues = {
    type: order.type,
    tableId: order.tableId,
    specialRequests: order.specialRequests ?? "",
    items: order.items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      customInstructions: item.customInstructions ?? "",
    })),
  };

  const handleSubmit = (values: OrderFormValues) => {
    setError(null);
    updateOrder.mutate(
      {
        tableId: values.tableId,
        specialRequests: values.specialRequests || undefined,
        items: values.items,
      },
      {
        onSuccess: () => navigate(`/orders/${order.id}`),
        onError: () => setError("Failed to update order. Please try again."),
      }
    );
  };

  return (
    <div>
      <SectionHeader title={`Edit Order #${order.orderNumber}`} subtitle={`Table ${order.tableNumber}`} />

      {error && <p style={{ color: C.danger, marginBottom: 12 }}>{error}</p>}

      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          maxWidth: 720,
        }}
      >
        <OrderForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isSubmitting={updateOrder.isPending}
          submitLabel="Save Changes"
          showTypeAndTable={false}
        />
      </div>
    </div>
  );
}