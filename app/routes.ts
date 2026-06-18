import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  route("login", "pages/LoginPage.tsx"),
  route("register", "pages/auth/RegisterPage.tsx"),

  // Order flow — full screen, no sidebar
  layout("components/layout/order/OrderFlowGuard.tsx", [
    route("order", "pages/order/OrderEntryPage.tsx"),
    route("order/table", "pages/order/CustomerTableSelectPage.tsx"),
    route("order/table-staff", "pages/order/StaffTableSelectPage.tsx"),
    route("order/menu", "pages/order/MenuOrderPage.tsx"),
    route("order/confirmation/:id", "pages/order/OrderConfirmationPage.tsx"),
    route("order/payment/:id", "pages/payment/PaymentPage.tsx"),
    route("order/thankyou/:id", "pages/payment/ThankYouPage.tsx"),
  ]),

  // Main app with sidebar
  layout("components/layout/AppLayout.tsx", [
    index("pages/DashboardPage.tsx"),
    route("menu", "pages/MenuPage.tsx"),
    route("inventory", "pages/inventory/InventoryRedirectPage.tsx"),
    route("inventory/catalog", "pages/inventory/InventoryCatalogPage.tsx"),
    route("inventory/movement", "pages/inventory/InventoryMovementPage.tsx"),
    route("reports", "pages/ReportsPage.tsx"),

    layout("components/layout/StaffLayout.tsx", [
      route("orders", "pages/order/OrderPage.tsx"),
      route("orders/create", "pages/order/CreateOrderPage.tsx"),
      route("orders/:id", "pages/order/OrderDetailPage.tsx"),
      route("orders/:id/edit", "pages/order/EditOrderPage.tsx"),
      route("staff", "pages/staff/StaffPage.tsx"),
      route("staff/add", "pages/staff/AddStaffPage.tsx"),
      route("staff/:id", "pages/staff/StaffDetailPage.tsx"),
      route("staff/:id/edit", "pages/staff/EditStaffPage.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
