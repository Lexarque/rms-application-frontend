import React, { useState } from "react";
import { C, font } from "../theme/tokens";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Table } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Btn } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";

// Restrict to exact literal strings based on your application's roles
type StaffRole = "Manager" | "Staff" | "Kitchen";
type StaffStatus = "On Duty" | "Off Duty";

interface StaffMember {
  name: string;
  role: StaffRole;
  status: StaffStatus;
  shift: string; // e.g., "9am – 5pm" or "—"
}

export default function StaffPage() {
  // Strongly typed state array
  const [staff] = useState<StaffMember[]>([
    {
      name: "Ahmad Zulkifli",
      role: "Manager",
      status: "On Duty",
      shift: "9am – 5pm",
    },
    {
      name: "Siti Norzahra",
      role: "Staff",
      status: "On Duty",
      shift: "11am – 7pm",
    },
    { 
      name: "Razif Hamdan", 
      role: "Kitchen", 
      status: "Off Duty", 
      shift: "—" 
    },
    {
      name: "Farah Aliya",
      role: "Staff",
      status: "On Duty",
      shift: "2pm – 10pm",
    },
  ]);

  return (
    <div>
      <SectionHeader
        title="Staff Management"
        subtitle="Manage roles, schedules, and access permissions"
        action={<Btn>+ Add Staff</Btn>}
      />
      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 14,
          padding: "20px 22px",
        }}
      >
        <Table
          columns={["Name", "Role", "Shift", "Status", "Actions"]}
          rows={staff.map((s) => [
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={s.name} size={28} />
              <span style={{ fontFamily: font.body, fontSize: 13 }}>
                {s.name}
              </span>
            </div>,
            <Badge
              key={`${s.name}-role`}
              label={s.role}
              color={s.role === "Manager" ? "gold" : "default"}
            />,
            s.shift,
            <Badge
              key={`${s.name}-status`}
              label={s.status}
              color={s.status === "On Duty" ? "success" : "default"}
            />,
            <Btn key={`${s.name}-btn`} variant="ghost" size="sm">
              Edit
            </Btn>,
          ])}
        />
      </div>
    </div>
  );
}