import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { C, font } from "~/theme/tokens";

export default function OrderFlowGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <p style={{ fontFamily: font.body, color: C.muted, padding: 24 }}>
        Loading...
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}