export const ROLE_ACCESS: Record<string, string[]> = {
  admin: ["dashboard", "menu", "orders", "new-order", "inventory", "staff", "reports"],
  manager: ["dashboard", "menu", "orders", "new-order", "inventory", "staff", "reports"],
  staff: ["dashboard", "menu", "orders", "new-order"],
  customer: [],
};

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "⊞", route: "/" },
  { key: "orders", label: "Orders", icon: "📋", route: "/orders" },
  { key: "new-order", label: "New Order", icon: "🧾", route: "/order/table-staff" },
  { key: "menu", label: "Menu", icon: "🍽", route: "/menu" },
  { key: "inventory", label: "Inventory", icon: "📦", route: "/inventory" },
  { key: "staff", label: "Staff", icon: "👥", route: "/staff" },
  { key: "reports", label: "Reports", icon: "📊", route: "/reports" },
];

export const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/order/table-staff": "New Order",
  "/menu": "Menu",
  "/inventory": "Inventory",
  "/staff": "Staff",
  "/reports": "Reports",
};