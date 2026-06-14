import React from "react";
import { useNavigate } from "react-router";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { C } from "~/theme/tokens";
import { OrderForm, type OrderFormValues } from "./components/OrderForm";
import { useCreateOrder } from "~/hooks/useOrderMutations";

const INITIAL_VALUES: OrderFormValues = {
  type: "DINE_IN",
  tableId: "",
  specialRequests: "",
  items: [],
};

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (values: OrderFormValues) => {
    setError(null);
    createOrder.mutate(
      {
        type: values.type,
        tableId: values.tableId,
        specialRequests: values.specialRequests || undefined,
        items: values.items.length > 0 ? values.items : undefined,
      },
      {
        onSuccess: (order) => navigate(`/orders/${order.id}`),
        onError: () => setError("Failed to create order. Please check the form and try again."),
      }
    );
  };

  return (
    <div>
      <SectionHeader title="New Order" subtitle="Create a dine-in or reservation order" />

      {error && (
        <p style={{ color: C.danger, marginBottom: 12 }}>{error}</p>
      )}

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
          initialValues={INITIAL_VALUES}
          onSubmit={handleSubmit}
          isSubmitting={createOrder.isPending}
          submitLabel="Create Order"
        />
      </div>
    </div>
  );
}