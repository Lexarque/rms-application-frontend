import React from "react";
import { Outlet } from "react-router";
import { RoleGuard } from "./RoleGuard";

const STAFF_ROLES = ["admin", "manager", "staff"];

export default function StaffLayout() {
  return (
    <RoleGuard allowed={STAFF_ROLES}>
      <Outlet />
    </RoleGuard>
  );
}