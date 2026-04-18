import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { InventoryProvider, useInventory } from "./InventoryContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return <InventoryProvider>{children}</InventoryProvider>;
}

describe("InventoryContext core flow", () => {
  it("supports add item -> adjust stock -> create reorder -> mark received -> resolve alert", () => {
    const { result } = renderHook(() => useInventory(), { wrapper });

    act(() => {
      result.current.addItem({
        name: "Tomato Puree",
        unit: "kg",
        currentQty: 20,
        minThreshold: 10,
        reorderLevel: 25,
        supplier: "Fresh Source",
        location: "Dry Storage D1",
        expiryDate: "2099-01-01",
      });
    });

    const addedItem = result.current.items.find((item) => item.name === "Tomato Puree");
    expect(addedItem).toBeDefined();
    if (!addedItem) throw new Error("Added item not found");

    act(() => {
      result.current.adjustStock({
        itemId: addedItem.id,
        delta: -5,
        reason: "Recipe prep",
        byUser: "Manager",
      });
    });

    const adjustedItem = result.current.items.find((item) => item.id === addedItem.id);
    expect(adjustedItem?.currentQty).toBe(15);
    expect(
      result.current.movements.some(
        (move) =>
          move.itemId === addedItem.id &&
          move.type === "ADJUST" &&
          move.qty === 5 &&
          move.reason === "Recipe prep"
      )
    ).toBe(true);

    act(() => {
      result.current.createReorderRequest({
        itemId: addedItem.id,
        qty: 10,
        requestedBy: "Manager",
      });
    });

    const createdRequest = result.current.reorderRequests.find(
      (req) => req.itemId === addedItem.id && req.qty === 10 && req.status === "Requested"
    );
    expect(createdRequest).toBeDefined();
    if (!createdRequest) throw new Error("Created reorder request not found");

    act(() => {
      result.current.markReorderReceived(createdRequest.id, "Manager");
    });

    const receivedRequest = result.current.reorderRequests.find((req) => req.id === createdRequest.id);
    expect(receivedRequest?.status).toBe("Received");

    const receivedItem = result.current.items.find((item) => item.id === addedItem.id);
    expect(receivedItem?.currentQty).toBe(25);
    expect(
      result.current.movements.some(
        (move) =>
          move.itemId === addedItem.id &&
          move.type === "IN" &&
          move.qty === 10 &&
          move.reason.includes(createdRequest.id)
      )
    ).toBe(true);

    const unresolvedAlert = result.current.alerts.find((alert) => !alert.resolved);
    expect(unresolvedAlert).toBeDefined();
    if (!unresolvedAlert) throw new Error("Expected at least one unresolved alert");

    act(() => {
      result.current.markAlertsResolved([unresolvedAlert.id]);
    });

    const resolvedAlert = result.current.alerts.find((alert) => alert.id === unresolvedAlert.id);
    expect(resolvedAlert?.resolved).toBe(true);
  });
});
