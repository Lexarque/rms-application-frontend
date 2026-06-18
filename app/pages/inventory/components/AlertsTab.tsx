import React from "react"
import { Badge } from "../../../components/ui/Badge"
import { Input } from "../../../components/ui/Input"
import { Table } from "../../../components/ui/Table"
import type { InventoryItem, InventoryMovement } from "../../../types/inventory"
import { badgeColor, statusOf } from "../utils"

type Props = {
    riskItems: InventoryItem[]
    monthMovements: InventoryMovement[]
    items: InventoryItem[]
    monthFilter: string
    setMonthFilter: (value: string) => void
}

export function AlertsTab({
    riskItems = [],
    monthMovements = [],
    items = [],
    monthFilter,
    setMonthFilter,
}: Props) {
    const safeRiskItems = Array.isArray(riskItems) ? riskItems : []
    const safeMovements = Array.isArray(monthMovements) ? monthMovements : []
    const safeItems = Array.isArray(items) ? items : []

    return (
        <div className="inv-grid single">
            <section className="inv-panel">
                <h3>Risk Alerts</h3>
                {safeRiskItems.length === 0 ? (
                    <div className="inv-ok">
                        No low-stock or out-of-stock items. Alert queue is
                        clear.
                    </div>
                ) : (
                    <div className="inv-alert-list">
                        {safeRiskItems.map((item) => {
                            const status = statusOf(item)
                            return (
                                <div key={item.id} className="inv-alert-row">
                                    <div>
                                        <strong>{item.item_name}</strong>
                                        <div className="inv-meta">
                                            {item.quantity} {item.unit} on hand,
                                            threshold {item.minimum_threshold}{" "}
                                            {item.unit}
                                        </div>
                                    </div>
                                    <Badge
                                        label={
                                            status === "OUT"
                                                ? "OUT OF STOCK"
                                                : "LOW STOCK"
                                        }
                                        color={badgeColor(status)}
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
