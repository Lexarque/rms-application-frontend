import React from "react";
import { C, font } from "../../theme/tokens";

interface TableProps {
  columns: string[];
  rows: React.ReactNode[][];
  emptyMessage?: string;
  onRowClick?: (rowIndex: number) => void; // Add this
}

export function Table({ columns, rows, emptyMessage = "No data.", onRowClick }: TableProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font.body, fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `0.5px solid ${C.border}`, background: "#FAFAF8" }}>
            {columns.map((column) => (
              <th
                key={column}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontSize: 12,
                  color: C.muted,
                  fontWeight: 600,
                  letterSpacing: "0.2px",
                  whiteSpace: "nowrap",
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 24, textAlign: "center", color: C.muted }}>{emptyMessage}</td></tr>
          ) : rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(i)}
              style={{
                borderBottom: `0.5px solid ${C.border}`,
                cursor: onRowClick ? "pointer" : "default", // Only show pointer if clickable
              }}
            >
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "12px 14px", color: C.text }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
