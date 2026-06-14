import React from "react";
import { Outlet } from "react-router";
import { RoleGuard } from "./RoleGuard";
import type { Role } from "~/types/role";

const ALLOWED: Role[] = ["admin", "manager", "staff"];

export default function StaffLayout() {
  return (
    <RoleGuard allowed={ALLOWED}>
      <Outlet />
    </RoleGuard>
  );
}