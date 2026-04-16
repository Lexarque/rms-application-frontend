import { C, font } from "../../theme/tokens";

interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: number;
}

export function StatCard({ label, value, sub, icon, trend }: StatCardProps) {
  const trendColor = 
    trend !== undefined && trend > 0 ? C.success 
    : trend !== undefined && trend < 0 ? C.danger 
    : C.muted;
    
  const trendSign = 
    trend !== undefined && trend > 0 ? "▲" 
    : trend !== undefined && trend < 0 ? "▼" 
    : "";

  return (
    <div
      style={{
        background: C.surface,
        border: `0.5px solid ${C.border}`,
        borderRadius: 14,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: C.muted,
            fontFamily: font.body,
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: C.text,
          fontFamily: font.display,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {(sub || trend !== undefined) && (
        <div style={{ fontSize: 12, color: trendColor, fontFamily: font.body }}>
          {trendSign} {sub}
        </div>
      )}
    </div>
  );
}