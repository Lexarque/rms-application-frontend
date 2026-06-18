import React from "react";
import { C, font } from "../../theme/tokens";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function Btn({ children, onClick, variant = "primary", size = "md", disabled, ...props }: ButtonProps) {
  const styles = {
    primary: { bg: C.text, text: "#fff", border: "none" },
    ghost:   { bg: "transparent", text: C.text, border: `1px solid ${C.border}` },
    danger:  { bg: "#fff5f5", text: C.danger, border: `1px solid #F0D0D0` },
  };
  const s = styles[variant];
  const pad = size === "sm" ? "6px 12px" : "9px 16px";
  
  return (
    <button 
      type="button"
      onClick={onClick} 
      disabled={disabled} 
      style={{
        background: s.bg, color: s.text, border: s.border,
        borderRadius: 10, padding: pad, fontSize: size === "sm" ? 12 : 13,
        fontWeight: 500, fontFamily: font.body, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1, transition: "opacity 0.15s, transform 0.15s",
      }}
      {...props}
    >
      {children}
    </button>
  );
}
