import React from "react";
import { font } from "../../theme/tokens";

export type BadgeColor = "default" | "success" | "warning" | "danger" | "info" | "gold";

interface BadgeProps {
  label: React.ReactNode; 
  color?: BadgeColor;
}

const colorMap: Record<BadgeColor, { bg: string; text: string }> = {
  default: { bg: "#F0EFEA", text: "#5F5E5A" },
  success: { bg: "#EAF3DE", text: "#3B6D11" },
  warning: { bg: "#FAEEDA", text: "#854F0B" },
  danger:  { bg: "#FCEBEB", text: "#A32D2D" },
  info:    { bg: "#E6F1FB", text: "#185FA5" },
  gold:    { bg: "#F5E8D4", text: "#7A4A10" },
};

export function Badge({ label, color = "default" }: BadgeProps) {
  // Fallback ensures safety if used in a mixed JS/TS environment
  const { bg, text } = colorMap[color] || colorMap.default;

  return (
    <span style={{
      background: bg, 
      color: text,
      fontSize: 11, 
      fontWeight: 500,
      padding: "2px 8px", 
      borderRadius: 99,
      letterSpacing: "0.3px", 
      fontFamily: font.body,
    }}>
      {label}
    </span>
  );
}

export default Badge;