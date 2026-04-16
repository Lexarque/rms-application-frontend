import React from "react";
import { C, font } from "../../theme/tokens";

interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 24,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontFamily: font.display,
            fontSize: 22,
            color: C.text,
            fontWeight: 700,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: C.muted,
              fontFamily: font.body,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}