import React from "react";
import { C, font } from "~/theme/tokens";
import type { StaffStats } from "~/types/dashboard";
import { formatRoleLabel } from "../utils";

interface Props {
  staff: StaffStats | null;
}

export const RoleBreakdownCard: React.FC<Props> = ({ staff }) => {
  // Backend returns null when the caller's role isn't permitted to see this at all (staff)
  if (staff === null) {
    return null;
  }

  const entries = Object.entries(staff.byRole);
  const max = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <div
      style={{
        background: C.surface,
        border: `0.5px solid ${C.border}`,
        borderRadius: 14,
        padding: "20px 22px",
      }}
    >
      <h3
        style={{
          fontFamily: font.display,
          fontSize: 16,
          color: C.text,
          margin: "0 0 16px",
          fontWeight: 600,
        }}
      >
        Staff by Role
      </h3>

      {entries.length === 0 ? (
        <p style={{ fontFamily: font.body, fontSize: 13, color: C.muted }}>No staff records.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {entries.map(([role, count]) => (
            <div key={role}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: font.body,
                  fontSize: 13,
                  color: C.text,
                  marginBottom: 4,
                }}
              >
                <span>{formatRoleLabel(role)}</span>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 4,
                  background: C.bg,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(count / max) * 100}%`,
                    background: C.accent,
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};