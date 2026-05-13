export const ROLE_ACCESS: Record<string, string[]> = {
  admin: ["dashboard", "menu", "orders", "inventory", "staff", "reports"],
  manager: ["dashboard", "menu", "orders", "inventory", "staff", "reports"],
  staff: ["dashboard", "menu", "orders"],
  kitchen: ["dashboard", "orders"],
};

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "⊞", route: "/" },
  { key: "orders", label: "Orders", icon: "📋", route: "/orders" },
  { key: "menu", label: "Menu", icon: "🍽", route: "/menu" },
  { key: "inventory", label: "Inventory", icon: "📦", route: "/inventory" },
  { key: "staff", label: "Staff", icon: "👥", route: "/staff" },
  { key: "reports", label: "Reports", icon: "📊", route: "/reports" },
];

export const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/menu": "Menu",
  "/inventory": "Inventory",
  "/staff": "Staff",
  "/reports": "Reports",
};