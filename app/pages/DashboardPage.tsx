import React from "react";
import { C, font } from "../theme/tokens";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatCard } from "../components/ui/StatCard";
import { Table } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";

export default function DashboardPage() {
  const recentOrders = [
    [
      "#1042",
      "Table 5",
      "Nasi Goreng, Teh Tarik",
      <Badge label="Completed" color="success" />,
    ],
    [
      "#1041",
      "Table 2",
      "Grilled Chicken, Juice",
      <Badge label="In Kitchen" color="warning" />,
    ],
    [
      "#1040",
      "Table 8",
      "Laksa, Roti Canai",
      <Badge label="Pending" color="info" />,
    ],
    [
      "#1039",
      "Table 1",
      "Mee Goreng Mamak",
      <Badge label="Completed" color="success" />,
    ],
  ];

  return (
    <div>
      <SectionHeader
        title="Dashboard"
        subtitle="Overview of today's restaurant operations"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Today's Revenue"
          value="RM 1,284"
          sub="+12% from yesterday"
          icon="💰"
          trend={1}
        />
        <StatCard
          label="Orders Today"
          value="47"
          sub="+5 since last hour"
          icon="📋"
          trend={1}
        />
        <StatCard
          label="Tables Active"
          value="6 / 12"
          sub="50% occupancy"
          icon="🪑"
          trend={0}
        />
        <StatCard
          label="Low Stock Items"
          value="3"
          sub="Needs attention"
          icon="📦"
          trend={-1}
        />
      </div>

      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
        }}
      >
        <h3
          style={{
            fontFamily: font.display,
            fontSize: 16,
            color: C.text,
            margin: "0 0 16px",
            fontWeight: 600,
          }}
        >
          Recent Orders
        </h3>
        <Table
          columns={["Order #", "Table", "Items", "Status"]}
          rows={recentOrders}
        />
      </div>
    </div>
  );
}
