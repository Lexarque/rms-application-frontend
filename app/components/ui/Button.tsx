import React from "react";
import { C, font } from "../../theme/tokens";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function Btn({ children, onClick, variant = "primary", size = "md", disabled, ...props }: ButtonProps) {
  const styles = {
    primary: { bg: C.accent, text: "#fff", border: "none" },
    ghost:   { bg: "transparent", text: C.text, border: `0.5px solid ${C.border}` },
    danger:  { bg: "#FCEBEB", text: C.danger, border: `0.5px solid #F7C1C1` },
  };
  const s = styles[variant];
  const pad = size === "sm" ? "6px 14px" : "10px 20px";
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      style={{
        background: s.bg, color: s.text, border: s.border,
        borderRadius: 8, padding: pad, fontSize: size === "sm" ? 12 : 13,
        fontWeight: 500, fontFamily: font.body, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1, transition: "opacity 0.15s",
      }}
      {...props}
    >
      {children}
    </button>
  );
}