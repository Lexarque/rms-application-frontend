import React from "react";
import { C, font } from "../../theme/tokens";

interface TableProps {
  columns: string[];
  rows: React.ReactNode[][];
  emptyMessage?: string;
}

export function Table({ columns, rows, emptyMessage = "No data." }: TableProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font.body, fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {columns.map((col, i) => (
              <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 500, color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 24, textAlign: "center", color: C.muted }}>{emptyMessage}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `0.5px solid ${C.border}` }}>
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