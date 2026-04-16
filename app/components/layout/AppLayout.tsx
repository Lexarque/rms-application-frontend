import React from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { ROLE_ACCESS, NAV_ITEMS, PAGE_TITLES } from "../../config/navigation";
import { C, font } from "../../theme/tokens";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import UnauthorizedPage from "../../pages/UnauthorizedPage";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If there's no user, redirect to login immediately
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = ROLE_ACCESS[user.role] || [];
  const currentKey =
    NAV_ITEMS.find((n) => n.route === location.pathname)?.key || "dashboard";
  const hasAccess = allowed.includes(currentKey);
  const title = PAGE_TITLES[location.pathname] || "Dashboard";

  return (
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
  );
}