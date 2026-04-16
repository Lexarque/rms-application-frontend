import React from "react";
import { C, font } from "../../theme/tokens";

interface InputProps {
  label?: string;
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
}

export function Input({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder, 
  required 
}: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: C.muted, fontFamily: font.body }}>
          {label}{required && <span style={{ color: C.danger }}> *</span>}
        </label>
      )}
      <input
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        style={{
          border: `0.5px solid ${C.border}`, 
          borderRadius: 8, 
          padding: "10px 12px",
          fontSize: 13, 
          fontFamily: font.body, 
          color: C.text, 
          background: C.surface,
          outline: "none", 
          width: "100%", 
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

export default Input;