import React, { createContext, useContext, useMemo, useState } from "react";
import { font } from "../theme/tokens";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  pushToast: (message: string, type?: ToastType, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

function toastColors(type: ToastType) {
  if (type === "success") return { bg: "#EAF3DE", text: "#3B6D11", border: "#CFE5B2" };
  if (type === "error") return { bg: "#FCEBEB", text: "#A32D2D", border: "#F7C1C1" };
  return { bg: "#E6F1FB", text: "#185FA5", border: "#BDD9F4" };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (message: string, type: ToastType = "info", durationMs = 2500) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, durationMs);
  };

  const value = useMemo(() => ({ pushToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 1200,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => {
          const colors = toastColors(toast.type);
          return (
            <div
              key={toast.id}
              style={{
                minWidth: 240,
                maxWidth: 360,
                background: colors.bg,
                color: colors.text,
                border: `0.5px solid ${colors.border}`,
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 12,
                fontFamily: font.body,
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              }}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
