import React from "react";
import { useNavigate } from "react-router";
import { useOrders } from "~/hooks/useOrders";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Btn } from "~/components/ui/Button";
import { C, font } from "~/theme/tokens";
import { OrderFilters } from "./components/OrderFilters";
import { OrderTable } from "./components/OrderTable";
import { OrderPagination } from "./components/OrderPagination";

export default function OrderPage() {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    isError,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    page,
    setPage,
    size,
  } = useOrders();

  const orders = data ?? [];
  const hasMore = orders.length === size;

  const handleRowClick = (index: number) => {
    const order = orders[index];
    if (order) navigate(`/orders/${order.id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/orders/${id}/edit`);
  };

  return (
    <div>
      <SectionHeader
        title="Orders Management"
        subtitle="View and manage customer orders"
        action={
          <Btn onClick={() => navigate("/orders/create")}>+ New Order</Btn>
        }
      />
      <OrderFilters
        value={searchInput}
        onChange={setSearchInput}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        type={typeFilter}
        onTypeChange={setTypeFilter}
      />
      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
        }}
      >
        {isLoading && orders.length === 0 ? (
          <p style={{ fontFamily: font.body }}>Loading orders...</p>
        ) : isError ? (
          <p style={{ fontFamily: font.body, color: "red" }}>
            Error loading data.
          </p>
        ) : (
          <>
            <OrderTable
              orders={orders}
              onRowClick={handleRowClick}
              onEdit={handleEdit}
            />
            <OrderPagination
              page={page}
              showingCount={orders.length}
              hasMore={hasMore}
              onPrevious={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => p + 1)}
            />
          </>
        )}
      </div>
    </div>
  );
}
