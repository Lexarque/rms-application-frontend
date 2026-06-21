import React from "react";
import { C, font } from "~/theme/tokens";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { StatCard } from "~/components/ui/StatCard";
import { useDashboard } from "~/hooks/useDashboard";
import { RoleBreakdownCard } from "./components/RoleBreakdownCard";
import { OrderStatusBreakdownCard } from "./components/OrderStatusBreakdownCard";
import { formatCurrency } from "./utils";

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  return (
    <div>
      <SectionHeader
        title="Dashboard"
        subtitle="Overview of today's restaurant operations"
      />

      {isLoading ? (
        <p style={{ fontFamily: font.body, color: C.muted }}>
          Loading dashboard...
        </p>
      ) : isError || !data ? (
        <p style={{ fontFamily: font.body, color: C.danger }}>
          Failed to load dashboard data.
        </p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <StatCard
              label="Today's Revenue"
              value={formatCurrency(data.orders.todayRevenue)}
              sub={`${data.orders.todayCount} order(s) today`}
              icon="💰"
              trend={0}
            />
            <StatCard
              label="Active Orders"
              value={String(data.orders.activeCount)}
              sub="In progress right now"
              icon="📋"
              trend={0}
            />
            <StatCard
              label="Menu Items"
              value={`${data.menu.availableCount} / ${data.menu.total}`}
              sub={
                data.menu.outOfStockCount > 0
                  ? `${data.menu.outOfStockCount} out of stock`
                  : "All in stock"
              }
              icon="🍽"
              trend={data.menu.outOfStockCount > 0 ? -1 : 1}
            />
            <StatCard
              label="Low Stock Items"
              value={String(data.inventory.lowStockCount)}
              sub={`${data.inventory.total} item(s) tracked`}
              icon="📦"
              trend={data.inventory.lowStockCount > 0 ? -1 : 1}
            />
            {data.staff !== null && (
              <StatCard
                label="Staff"
                value={String(data.staff.total)}
                sub="Total active accounts"
                icon="👥"
                trend={0}
              />
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            <OrderStatusBreakdownCard orders={data.orders} />
            <RoleBreakdownCard staff={data.staff} />
          </div>
        </>
      )}
    </div>
  );
}
