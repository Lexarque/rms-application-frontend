import React from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { InventoryProvider } from "../../context/InventoryContext";
import { ToastProvider } from "../../context/ToastContext";
import { ROLE_ACCESS, PAGE_TITLES } from "../../config/navigation";
import { C, font } from "../../theme/tokens";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import UnauthorizedPage from "../../pages/UnauthorizedPage";

function getRouteKey(pathname: string): string {
  if (pathname === "/" || pathname === "/dashboard") return "dashboard";
  const [first] = pathname.split("/").filter(Boolean);
  return first || "dashboard";
}

function getTitle(pathname: string): string {
  if (pathname === "/" || pathname === "/dashboard") return "Dashboard";
  if (pathname === "/inventory") return "Inventory Overview";
  if (pathname === "/inventory/movements") return "Stock Movements";
  if (pathname === "/inventory/reorders") return "Reorder Requests";
  if (pathname === "/inventory/alerts") return "Inventory Alerts";
  if (pathname.startsWith("/inventory/items/")) return "Item Detail";
  return PAGE_TITLES[pathname] || "Dashboard";
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If there's no user, redirect to login immediately
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = ROLE_ACCESS[user.role] || [];
  const currentKey = getRouteKey(location.pathname);
  const hasAccess = allowed.includes(currentKey);
  const title = getTitle(location.pathname);

  return (
    <InventoryProvider>
      <ToastProvider>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            background: C.bg,
            fontFamily: font.body,
          }}
        >
          {/* Pass the location and navigate from react-router to your Sidebar */}
          <Sidebar route={location.pathname} navigate={navigate} user={user} />
          
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <Topbar title={title} user={user} onLogout={logout} />
            <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
              {/* Outlet replaces your switch statement. React Router injects the page here. */}
              {hasAccess ? <Outlet /> : <UnauthorizedPage />}
            </main>
          </div>
        </div>
      </ToastProvider>
    </InventoryProvider>
  );
}
