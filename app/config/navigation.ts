export const ROLE_ACCESS: Record<string, string[]> = {
  Manager: ["dashboard", "menu", "orders", "inventory", "staff", "reports"],
  Staff: ["dashboard", "menu", "orders"],
  Kitchen: ["dashboard", "orders"],
};

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "⊞", route: "/dashboard" },
  { key: "orders", label: "Orders", icon: "📋", route: "/orders" },
  { key: "menu", label: "Menu", icon: "🍽", route: "/menu" },
  { key: "inventory", label: "Inventory", icon: "📦", route: "/inventory" },
  { key: "staff", label: "Staff", icon: "👥", route: "/staff" },
  { key: "reports", label: "Reports", icon: "📊", route: "/reports" },
];

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/orders": "Orders",
  "/menu": "Menu",
  "/inventory": "Inventory Overview",
  "/staff": "Staff",
  "/reports": "Reports",
};
