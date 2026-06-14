import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { STAFF_ROLES } from "~/types/role";

export default function OrderEntryPage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return STAFF_ROLES.includes(user.role)
    ? <Navigate to="/order/table-staff" replace />
    : <Navigate to="/order/table" replace />;
}