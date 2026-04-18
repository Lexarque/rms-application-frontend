import React from "react";
import { useNavigate } from "react-router";
import { C, font } from "../theme/tokens";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Btn } from "../components/ui/Button";

// Define the shape of the report card data
interface ReportCardData {
  label: string;
  icon: string;
  desc: string;
  route?: string;
}

// Extracted outside the component for better performance
const REPORT_CARDS: ReportCardData[] = [
  {
    label: "Sales Report",
    icon: "💰",
    desc: "Daily, weekly, monthly revenue breakdown",
  },
  {
    label: "Order History",
    icon: "📋",
    desc: "All processed orders and their details",
  },
  {
    label: "Staff Activity",
    icon: "👥",
    desc: "Login logs, shift records, and actions",
  },
];

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <div>
      <SectionHeader
        title="Reports"
        subtitle="Sales, inventory, and staff activity summaries"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {REPORT_CARDS.map((r) => (
          <div
            key={r.label} // Used a stable string key instead of the array index
            style={{
              background: C.surface,
              border: `0.5px solid ${C.border}`,
              borderRadius: 14,
              padding: "20px 22px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{r.icon}</div>
            <div
              style={{
                fontFamily: font.display,
                fontSize: 15,
                fontWeight: 600,
                color: C.text,
                marginBottom: 6,
              }}
            >
              {r.label}
            </div>
            <div
              style={{ fontSize: 12, color: C.muted, fontFamily: font.body }}
            >
              {r.desc}
            </div>
            <div style={{ marginTop: 16 }}>
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => r.route && navigate(r.route)}
                disabled={!r.route}
              >
                View Report
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
