export const ROLE_ACCESS: Record<string, string[]> = {
  admin: ["dashboard", "menu", "orders", "new-order", "inventory", "staff", "reports"],
  manager: ["dashboard", "menu", "orders", "new-order", "inventory", "staff", "reports"],
  staff: ["dashboard", "menu", "orders", "new-order"],
  customer: [],
};

export interface NavChildItem {
  key: string;
  label: string;
  route: string;
}

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  route: string;
  children?: NavChildItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "⊞", route: "/" },
  { key: "orders", label: "Orders", icon: "📋", route: "/orders" },
  { key: "new-order", label: "New Order", icon: "🧾", route: "/order/table-staff" },
  { key: "menu", label: "Menu", icon: "🍽", route: "/menu" },
  {
    key: "inventory",
    label: "Inventory",
    icon: "📦",
    route: "/inventory",
    children: [
      { key: "inventory-catalog", label: "Catalog", route: "/inventory/catalog" },
      { key: "inventory-movement", label: "Stock Movement", route: "/inventory/movement" },
    ],
  },
  { key: "staff", label: "Staff", icon: "👥", route: "/staff" },
  { key: "reports", label: "Reports", icon: "📊", route: "/reports" },
];

export const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/order/table-staff": "New Order",
  "/menu": "Menu",
  "/inventory": "Inventory",
  "/inventory/catalog": "Inventory",
  "/inventory/movement": "Stock Movement",
  "/staff": "Staff",
  "/reports": "Reports",
};

export function isRouteActive(route: string, pathname: string) {
  if (route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function getActiveNavKey(pathname: string) {
  return NAV_ITEMS.find((item) => isRouteActive(item.route, pathname))?.key || "dashboard";
}

export function getPageTitle(pathname: string) {
  const titleEntry = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([route]) => isRouteActive(route, pathname));
  return titleEntry?.[1] || "Dashboard";
}
