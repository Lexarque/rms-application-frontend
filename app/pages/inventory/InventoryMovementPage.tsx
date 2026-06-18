import React from "react";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { InventoryStyles } from "./styles";
import { MovementTab } from "./components/MovementTab";
import { useInventoryModule } from "./useInventoryModule";

export default function InventoryMovementPage() {
  const inventory = useInventoryModule();

  return (
    <div>
      <SectionHeader
        title="Stock Movement"
        subtitle="Record stock movements"
      />

      <div className="inv-kpi-row">
        <div className="inv-kpi-card">
          <span>Total Units On Hand</span>
          <strong>{inventory.metrics.totalQty.toLocaleString()}</strong>
        </div>
        <div className="inv-kpi-card">
          <span>Available</span>
          <strong>{inventory.metrics.available}</strong>
        </div>
        <div className="inv-kpi-card">
          <span>Low Stock</span>
          <strong>{inventory.metrics.low}</strong>
        </div>
        <div className="inv-kpi-card">
          <span>Out of Stock</span>
          <strong>{inventory.metrics.out}</strong>
        </div>
      </div>

      {inventory.errorMessage && <div className="inv-error">{inventory.errorMessage}</div>}

      <MovementTab
        items={inventory.items}
        selectedId={inventory.selectedId}
        selectedItem={inventory.selectedItem}
        movementItemQuery={inventory.movementItemQuery}
        movementItemOptions={inventory.movementItemOptions}
        adjustType={inventory.adjustType}
        adjustQty={inventory.adjustQty}
        adjustNote={inventory.adjustNote}
        movementLines={inventory.movementLines}
        setSelectedId={inventory.setSelectedId}
        setMovementItemQuery={inventory.setMovementItemQuery}
        setAdjustType={inventory.setAdjustType}
        setAdjustQty={inventory.setAdjustQty}
        setAdjustNote={inventory.setAdjustNote}
        onAddMovementLine={inventory.addMovementLine}
        onRemoveMovementLine={inventory.removeMovementLine}
        onClearMovementLines={inventory.clearMovementLines}
        onSubmitMovementLines={inventory.submitMovementLines}
      />

      <InventoryStyles />
    </div>
  );
}
