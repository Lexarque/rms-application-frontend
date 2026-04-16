import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  // Public Login Route
  route("login", "pages/LoginPage.tsx"),

  // Protected App Routes wrapped in the Layout
  layout("components/layout/AppLayout.tsx", [
    index("pages/DashboardPage.tsx"), // Only "/"
    route("orders", "pages/OrdersPage.tsx"),
    route("menu", "pages/MenuPage.tsx"),
    route("inventory", "pages/InventoryPage.tsx"),
    route("staff", "pages/StaffPage.tsx"),
    route("reports", "pages/ReportsPage.tsx"),
  ]),
] satisfies RouteConfig;
