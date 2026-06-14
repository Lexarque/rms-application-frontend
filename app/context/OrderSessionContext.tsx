import React, { createContext, useContext, useState } from "react";
import type { OrderSession, OrderType } from "~/types/order";

interface OrderSessionContextValue {
  session: OrderSession | null;
  setSession: (session: OrderSession | null) => void;
  clearSession: () => void;
}

const OrderSessionContext = createContext<OrderSessionContextValue | null>(null);

export function OrderSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<OrderSession | null>(null);

  const clearSession = () => setSession(null);

  return (
    <OrderSessionContext.Provider value={{ session, setSession, clearSession }}>
      {children}
    </OrderSessionContext.Provider>
  );
}

export function useOrderSession() {
  const ctx = useContext(OrderSessionContext);
  if (!ctx) throw new Error("useOrderSession must be used within OrderSessionProvider");
  return ctx;
}