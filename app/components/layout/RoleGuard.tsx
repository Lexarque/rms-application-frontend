import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { C, font } from "~/theme/tokens";

interface Props {
  allowed: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowed, children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p style={{ fontFamily: font.body, color: C.muted, padding: 24 }}>Checking access...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.role)) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ fontFamily: font.body, color: C.danger }}>
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}