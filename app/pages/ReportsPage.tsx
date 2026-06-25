import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { C, font } from "../theme/tokens";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Btn } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Table } from "../components/ui/Table";
import type { OrderDto, OrderStatus } from "~/types/order";
import {
  fetchInventoryItemMovements,
  fetchInventoryItems,
  fetchInventoryMovements,
} from "../queries/inventory/inventoryApi";
import type { InventoryItem, InventoryMovement } from "../types/inventory";

type ReportKey = "sales" | "orders" | "staff" | "inventory";

interface StaffDto {
  id: number;
  fullName: string;
  username: string;
  role: string;
  phoneNumber: string;
}

interface DataTableResponse<T> {
  data: T[];
  totalRecords: number;
  filteredRecords: number;
}

const REPORT_CARDS: Array<{
  key: ReportKey;
  label: string;
  icon: string;
  desc: string;
}> = [
  {
    key: "sales",
    label: "Sales Report",
    icon: "💰",
    desc: "Revenue, order volume, and top-selling items",
  },
  {
    key: "orders",
    label: "Order History",
    icon: "📋",
    desc: "Recent orders, statuses, and customer details",
  },
  {
    key: "staff",
    label: "Staff Activity",
    icon: "👥",
    desc: "Orders handled and revenue attributed to staff",
  },
  {
    key: "inventory",
    label: "Inventory Report",
    icon: "📦",
    desc: "Stock movement history by month or item",
  },
];

const REPORT_KEYS: ReportKey[] = ["sales", "orders", "staff", "inventory"];

function isReportKey(value: string | null): value is ReportKey {
  return REPORT_KEYS.includes(value as ReportKey);
}

const FINALIZED_STATUSES: OrderStatus[] = ["SERVED", "COMPLETED"];

const currencyFormatter = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
});

const longDateFormatter = new Intl.DateTimeFormat("en-MY", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dayFormatter = new Intl.DateTimeFormat("en-MY", {
  month: "short",
  day: "numeric",
});

function toDateInputValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

function formatLongDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : longDateFormatter.format(date);
}

function formatDayLabel(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : dayFormatter.format(date);
}

function calculateOrderTotal(order: OrderDto): number {
  if (typeof order.totalAmount === "number") {
    return order.totalAmount;
  }

  return order.items.reduce(
    (sum, item) => sum + item.priceAtOrder * item.quantity,
    0,
  );
}

async function fetchReportOrders(from: string, to: string): Promise<OrderDto[]> {
  const { data } = await api.get<OrderDto[]>("/orders", {
    params: {
      from,
      to,
      page: 0,
      size: 1000,
      sort: "created_at,desc",
    },
  });
  return Array.isArray(data) ? data : [];
}

async function fetchStaffMembers(): Promise<StaffDto[]> {
  const { data } = await api.get<DataTableResponse<StaffDto>>("/users/staff", {
    params: {
      name: "",
      page: 0,
      size: 500,
    },
  });
  return Array.isArray(data?.data) ? data.data : [];
}

function getStaffKey(order: OrderDto): string {
  return order.staffId ?? order.staffName ?? "Unassigned";
}

export default function ReportsPage() {
  const today = toDateInputValue(new Date());
  const monthStart = toDateInputValue(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const activeReport = isReportKey(searchParams.get("report"))
    ? (searchParams.get("report") as ReportKey)
    : "sales";

  const setActiveReport = (report: ReportKey) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("report", report);
        return next;
      },
      { replace: true },
    );
  };

  const [fromDate, setFromDate] = useState(monthStart);
  const [toDate, setToDate] = useState(today);
  const [orderSearch, setOrderSearch] = useState("");
  const [inventoryMonth, setInventoryMonth] = useState(today.slice(0, 7));
  const [inventoryScope, setInventoryScope] = useState<"all" | "item">("all");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState("");

  const ordersQuery = useQuery({
    queryKey: ["reports", "orders", fromDate, toDate],
    queryFn: () => fetchReportOrders(fromDate, toDate),
    placeholderData: (previousData) => previousData,
  });

  const staffQuery = useQuery({
    queryKey: ["reports", "staff"],
    queryFn: fetchStaffMembers,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (activeReport !== "inventory") return;

    const loadItems = async () => {
      try {
        const data = await fetchInventoryItems();
        setInventoryItems(data);
        setSelectedItemId((prev) => prev || data[0]?.id || "");
      } catch {
        setInventoryError("Failed to load inventory items.");
      }
    };

    void loadItems();
  }, [activeReport]);

  useEffect(() => {
    if (activeReport !== "inventory") return;

    const loadMovements = async () => {
      setInventoryError("");
      setIsLoadingInventory(true);

      try {
        const data =
          inventoryScope === "item" && selectedItemId
            ? await fetchInventoryItemMovements(selectedItemId, inventoryMonth)
            : await fetchInventoryMovements(inventoryMonth);
        setInventoryMovements(data);
      } catch {
        setInventoryError("Failed to load inventory movements.");
        setInventoryMovements([]);
      } finally {
        setIsLoadingInventory(false);
      }
    };

    if (inventoryScope === "item" && !selectedItemId) {
      setInventoryMovements([]);
      return;
    }

    void loadMovements();
  }, [activeReport, inventoryMonth, inventoryScope, selectedItemId]);

  const orders = ordersQuery.data ?? [];
  const staffMembers = staffQuery.data ?? [];

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((order) => {
      const haystack = [
        order.orderNumber,
        order.customerName ?? "",
        order.tableNumber ?? "",
        order.staffName ?? "",
        order.status,
        order.type,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, orderSearch]);

  const finalizedOrders = useMemo(
    () => orders.filter((order) => FINALIZED_STATUSES.includes(order.status)),
    [orders],
  );

  const salesSummary = useMemo(() => {
    const revenue = finalizedOrders.reduce(
      (sum, order) => sum + calculateOrderTotal(order),
      0,
    );

    return {
      revenue,
      orders: finalizedOrders.length,
      allOrders: orders.length,
      averageOrderValue: finalizedOrders.length
        ? revenue / finalizedOrders.length
        : 0,
    };
  }, [finalizedOrders, orders.length]);

  const dailyRevenue = useMemo(() => {
    const grouped = new Map<
      string,
      { date: string; revenue: number; orders: number }
    >();

    finalizedOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      if (Number.isNaN(date.getTime())) return;

      const key = toDateInputValue(date);
      const current = grouped.get(key) ?? {
        date: key,
        revenue: 0,
        orders: 0,
      };

      current.revenue += calculateOrderTotal(order);
      current.orders += 1;
      grouped.set(key, current);
    });

    return [...grouped.values()].sort((a, b) => b.date.localeCompare(a.date));
  }, [finalizedOrders]);

  const topItems = useMemo(() => {
    const grouped = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    finalizedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current =
          grouped.get(item.menuItemId) ?? ({
            name: item.menuItemName,
            quantity: 0,
            revenue: 0,
          } as const);

        grouped.set(item.menuItemId, {
          name: item.menuItemName || current.name,
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.priceAtOrder * item.quantity,
        });
      });
    });

    return [...grouped.entries()]
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [finalizedOrders]);

  const staffActivity = useMemo(() => {
    const roster =
      staffMembers.length > 0
        ? staffMembers.map((staff) => ({
            key: String(staff.id),
            name: staff.fullName,
            role: staff.role,
            username: staff.username,
          }))
        : Array.from(
            new Map(
              orders
                .filter((order) => order.staffId || order.staffName)
                .map((order) => {
                  const key = getStaffKey(order);
                  return [
                    key,
                    {
                      key,
                      name: order.staffName ?? "Unassigned",
                      role: order.staffId ? "Staff" : "Unassigned",
                      username: order.staffName ?? "-",
                    },
                  ] as const;
                }),
            ).values(),
          );

    return roster
      .map((staff) => {
        const handledOrders = orders.filter((order) => {
          const staffKey = getStaffKey(order);
          return staffKey === staff.key || staff.name === order.staffName;
        });

        const revenueHandled = handledOrders
          .filter((order) => FINALIZED_STATUSES.includes(order.status))
          .reduce((sum, order) => sum + calculateOrderTotal(order), 0);

        const lastActivity = handledOrders.reduce<string | null>((latest, order) => {
          if (!order.updatedAt) return latest;
          if (!latest) return order.updatedAt;
          return new Date(order.updatedAt) > new Date(latest)
            ? order.updatedAt
            : latest;
        }, null);

        return {
          ...staff,
          ordersHandled: handledOrders.length,
          revenueHandled,
          completedOrders: handledOrders.filter(
            (order) => order.status === "COMPLETED",
          ).length,
          lastActivity,
        };
      })
      .sort(
        (a, b) =>
          b.ordersHandled - a.ordersHandled || b.revenueHandled - a.revenueHandled,
      );
  }, [orders, staffMembers]);

  const inventorySummary = useMemo(() => {
    const incoming = inventoryMovements
      .filter((movement) => movement.movement_type === "IN")
      .reduce((sum, movement) => sum + movement.quantity, 0);
    const outgoing = inventoryMovements
      .filter((movement) => movement.movement_type === "OUT")
      .reduce((sum, movement) => sum + movement.quantity, 0);
    const adjusted = inventoryMovements.filter(
      (movement) => movement.movement_type === "ADJUST",
    ).length;

    return {
      incoming,
      outgoing,
      adjusted,
      total: inventoryMovements.length,
    };
  }, [inventoryMovements]);

  const inventoryItemNameById = useMemo(() => {
    return new Map(inventoryItems.map((item) => [item.id, item.item_name]));
  }, [inventoryItems]);

  const renderMetricCard = (
    label: string,
    value: string,
    hint?: string,
    color?: string,
  ) => (
    <div
      style={{
        border: `0.5px solid ${C.border}`,
        borderRadius: 12,
        padding: 14,
        background: C.surface,
      }}
    >
      <div
        style={{
          color: C.muted,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontFamily: font.display,
          fontWeight: 700,
          color: color ?? C.text,
          marginTop: 4,
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );

  return (
    <div>
      <SectionHeader
        title="Reports"
        subtitle="Sales, order history, and staff activity summaries"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {REPORT_CARDS.map((report) => {
          const active = activeReport === report.key;
          return (
            <button
              key={report.key}
              type="button"
              onClick={() => setActiveReport(report.key)}
              style={{
                textAlign: "left",
                background: active ? C.accentLight : C.surface,
                border: `1px solid ${active ? C.accent : C.border}`,
                borderRadius: 14,
                padding: "20px 22px",
                cursor: "pointer",
                boxShadow: active ? "0 10px 28px rgba(201, 123, 42, 0.08)" : "none",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{report.icon}</div>
              <div
                style={{
                  fontFamily: font.display,
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: 6,
                }}
              >
                {report.label}
              </div>
              <div style={{ fontSize: 12, color: C.muted, fontFamily: font.body }}>
                {report.desc}
              </div>
              <div style={{ marginTop: 16 }}>
                <Btn variant={active ? "primary" : "ghost"} size="sm">
                  {active ? "Viewing" : "View Report"}
                </Btn>
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 16,
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          display: "grid",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: font.display,
                fontSize: 24,
                fontWeight: 700,
                color: C.text,
              }}
            >
              {REPORT_CARDS.find((report) => report.key === activeReport)?.label}
            </div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
              {activeReport === "sales" &&
                "Revenue is based on served and completed orders in the selected date range."}
              {activeReport === "orders" &&
                "Browse recent order records and search by order number, customer, table, staff, or status."}
              {activeReport === "staff" &&
                "Staff activity is derived from orders assigned to each staff member in the selected range."}
              {activeReport === "inventory" &&
                "Inventory movement history is grouped by month, with optional filtering by item."}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn size="sm" variant="ghost" onClick={() => setActiveReport("sales")}>
              Sales
            </Btn>
            <Btn size="sm" variant="ghost" onClick={() => setActiveReport("orders")}>
              Orders
            </Btn>
            <Btn size="sm" variant="ghost" onClick={() => setActiveReport("staff")}>
              Staff
            </Btn>
            <Btn size="sm" variant="ghost" onClick={() => setActiveReport("inventory")}>
              Inventory
            </Btn>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          <Input
            type="date"
            label="From"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            type="date"
            label="To"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        {activeReport === "sales" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
              }}
            >
              {renderMetricCard(
                "Revenue",
                formatCurrency(salesSummary.revenue),
                "Served and completed orders only",
                C.success,
              )}
              {renderMetricCard(
                "Finalized Orders",
                String(salesSummary.orders),
                `${salesSummary.allOrders} total orders in range`,
                C.info,
              )}
              {renderMetricCard(
                "Average Order Value",
                formatCurrency(salesSummary.averageOrderValue),
                "Average across finalized orders",
                C.accent,
              )}
              {renderMetricCard(
                "Top Item Count",
                String(topItems[0]?.quantity ?? 0),
                topItems[0]?.name ?? "No sold items yet",
                C.warning,
              )}
            </div>

            {ordersQuery.isError && (
              <div
                style={{
                  border: "1px solid #efc3c3",
                  background: "#fff5f5",
                  color: "#a42c2c",
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 12,
                }}
              >
                Failed to load sales data.
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
                gap: 14,
              }}
            >
              <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 10 }}>
                <Table
                  columns={["Day", "Orders", "Revenue"]}
                  rows={dailyRevenue.map((row) => [
                    formatDayLabel(row.date),
                    String(row.orders),
                    formatCurrency(row.revenue),
                  ])}
                  emptyMessage={
                    ordersQuery.isLoading
                      ? "Loading sales data..."
                      : "No finalized orders found for this range."
                  }
                />
              </div>
              <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 10 }}>
                <Table
                  columns={["Item", "Qty", "Revenue"]}
                  rows={topItems.map((item) => [
                    item.name,
                    String(item.quantity),
                    formatCurrency(item.revenue),
                  ])}
                  emptyMessage="No top items to show."
                />
              </div>
            </div>
          </>
        )}

        {activeReport === "orders" && (
          <>
            <Input
              label="Search orders"
              placeholder="Order number, customer, table, staff, or status"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
            />

            {ordersQuery.isError && (
              <div
                style={{
                  border: "1px solid #efc3c3",
                  background: "#fff5f5",
                  color: "#a42c2c",
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 12,
                }}
              >
                Failed to load order history.
              </div>
            )}

            <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 10 }}>
              <Table
                columns={["Date", "Order", "Customer / Table", "Status", "Staff", "Type", "Total"]}
                rows={filteredOrders.map((order) => [
                  formatLongDate(order.createdAt),
                  order.orderNumber,
                  order.customerName || `Table ${order.tableNumber || "-"}`,
                  <Badge
                    key={`${order.id}-status`}
                    label={order.status}
                    color={
                      order.status === "COMPLETED" || order.status === "SERVED"
                        ? "success"
                        : order.status === "CANCELLED"
                          ? "danger"
                          : order.status === "READY"
                            ? "warning"
                            : "info"
                    }
                  />,
                  order.staffName || "-",
                  order.type,
                  formatCurrency(calculateOrderTotal(order)),
                ])}
                emptyMessage={
                  ordersQuery.isLoading
                    ? "Loading order history..."
                    : "No orders found for this filter."
                }
              />
            </div>
          </>
        )}

        {activeReport === "staff" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
              }}
            >
              {renderMetricCard(
                "Staff Members",
                String(staffActivity.length),
                "Based on the current staff list or order assignments",
                C.info,
              )}
              {renderMetricCard(
                "Orders Assigned",
                String(staffActivity.reduce((sum, row) => sum + row.ordersHandled, 0)),
                "Orders linked to staff in the selected range",
                C.accent,
              )}
              {renderMetricCard(
                "Revenue Attributed",
                formatCurrency(
                  staffActivity.reduce((sum, row) => sum + row.revenueHandled, 0),
                ),
                "Finalized orders handled by staff",
                C.success,
              )}
            </div>

            {staffQuery.isError && (
              <div
                style={{
                  border: "1px solid #efc3c3",
                  background: "#fff5f5",
                  color: "#a42c2c",
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 12,
                }}
              >
                Failed to load staff data.
              </div>
            )}

            <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 10 }}>
              <Table
                columns={["Staff", "Role", "Orders Handled", "Completed", "Revenue", "Last Activity"]}
                rows={staffActivity.map((staff) => [
                  staff.name,
                  staff.role || "-",
                  String(staff.ordersHandled),
                  String(staff.completedOrders),
                  formatCurrency(staff.revenueHandled),
                  formatLongDate(staff.lastActivity ?? ""),
                ])}
                emptyMessage={
                  staffQuery.isLoading
                    ? "Loading staff activity..."
                    : "No staff activity found for this range."
                }
              />
            </div>
          </>
        )}

        {activeReport === "inventory" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
              }}
            >
              {renderMetricCard(
                "Total Logs",
                String(inventorySummary.total),
                `Month: ${inventoryMonth}`,
                C.info,
              )}
              {renderMetricCard(
                "Stock In",
                String(inventorySummary.incoming),
                "Incoming movement quantity",
                C.success,
              )}
              {renderMetricCard(
                "Stock Out",
                String(inventorySummary.outgoing),
                "Outgoing movement quantity",
                C.danger,
              )}
              {renderMetricCard(
                "Adjustments",
                String(inventorySummary.adjusted),
                "Adjustment records in the selected month",
                C.accent,
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <Input
                type="month"
                label="Month"
                value={inventoryMonth}
                onChange={(e) => setInventoryMonth(e.target.value)}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: C.muted,
                    fontFamily: font.body,
                  }}
                >
                  Scope
                </label>
                <select
                  value={inventoryScope}
                  onChange={(e) => setInventoryScope(e.target.value as "all" | "item")}
                  style={{
                    border: `0.5px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontFamily: font.body,
                    color: C.text,
                    background: C.surface,
                    outline: "none",
                  }}
                >
                  <option value="all">All Inventory Items</option>
                  <option value="item">Single Item</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: C.muted,
                    fontFamily: font.body,
                  }}
                >
                  Item
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  disabled={inventoryScope !== "item"}
                  style={{
                    border: `0.5px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontFamily: font.body,
                    color: C.text,
                    background: inventoryScope === "item" ? C.surface : "#f5f5f5",
                    outline: "none",
                  }}
                >
                  {inventoryItems.length === 0 && <option value="">No items</option>}
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {inventoryError && (
              <div
                style={{
                  border: "1px solid #efc3c3",
                  background: "#fff5f5",
                  color: "#a42c2c",
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 12,
                }}
              >
                {inventoryError}
              </div>
            )}

            <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 10 }}>
              <Table
                columns={["Date", "Item", "Type", "Quantity", "Reference", "Performed By", "Note"]}
                rows={inventoryMovements.map((movement) => [
                  movement.created_at || "-",
                  inventoryItemNameById.get(movement.item_id) ?? movement.item_id,
                  <Badge
                    key={`${movement.id}-type`}
                    label={movement.movement_type}
                    color={
                      movement.movement_type === "IN"
                        ? "success"
                        : movement.movement_type === "OUT"
                          ? "danger"
                          : "info"
                    }
                  />,
                  String(movement.quantity),
                  movement.reference || "-",
                  movement.performed_by || "-",
                  movement.note || "-",
                ])}
                emptyMessage={
                  isLoadingInventory
                    ? "Loading movement history..."
                    : "No movement records found for this filter."
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
