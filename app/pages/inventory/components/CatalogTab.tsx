import React from "react"
import { Badge } from "../../../components/ui/Badge"
import { Btn } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { Table } from "../../../components/ui/Table"
import { C } from "../../../theme/tokens"
import type { InventoryItem, StatusFilter } from "../../../types/inventory"
import { badgeColor, statusOf } from "../utils"

type Props = {
    selectedItem: InventoryItem | null
    filteredItems: InventoryItem[]
    statusFilter: StatusFilter
    query: string
    setStatusFilter: (value: StatusFilter) => void
    setQuery: (value: string) => void
    setSelectedId: (id: string) => void
    onCreateItem: () => void
    onEditItem: (id: string) => void
    onDeleteItem: (id: string) => void
}

export function CatalogTab({
    selectedItem,
    filteredItems,
    statusFilter,
    query,
    setStatusFilter,
    setQuery,
    setSelectedId,
    onCreateItem,
    onEditItem,
    onDeleteItem,
}: Props) {
    const statusCounts = filteredItems.reduce(
        (acc, item) => {
            const s = statusOf(item)
            acc.ALL += 1
            acc[s] += 1
            return acc
        },
        { ALL: 0, AVAILABLE: 0, LOW: 0, OUT: 0 },
    )

    return (
        <section className="inv-panel">
            <div className="inv-row-between">
                <div>
                    <h3>Item Registry</h3>
                    <p className="inv-subtle">
                        Browse, filter, update, and remove stock records
                    </p>
                </div>
                <Btn variant="primary" onClick={onCreateItem}>
                    New Inventory Item
                </Btn>
            </div>

            <div className="inv-filter-grid">
                <Input
                    label="Search by item / category"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Olive Oil"
                />
                <div>
                    <div className="inv-label">Stock Status</div>
                    <div className="inv-pills">
                        {(
                            ["ALL", "AVAILABLE", "LOW", "OUT"] as StatusFilter[]
                        ).map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setStatusFilter(value)}
                                className={
                                    statusFilter === value
                                        ? "inv-pill active"
                                        : "inv-pill"
                                }
                            >
                                {value}{" "}
                                <span className="inv-pill-count">
                                    {statusCounts[value]}
                                </span>
                            </button>
                        ))}
                    </div>
                    {(query.trim() || statusFilter !== "ALL") && (
                        <div className="inv-filter-summary">
                            Showing {filteredItems.length} item
                            {filteredItems.length === 1 ? "" : "s"}
                            {query.trim() ? ` matching "${query.trim()}"` : ""}
                            {statusFilter !== "ALL"
                                ? ` with status ${statusFilter}`
                                : ""}
                            .
                        </div>
                    )}
                </div>
            </div>

            <div className="inv-table-wrap">
                <Table
                    className="inv-catalog-table-wrap"
                    columns={[
                        "Item Name",
                        "Qty",
                        "Min Threshold",
                        "Status",
                        "Last Updated",
                        "Actions",
                    ]}
                    rows={filteredItems.map((item) => [
                        <div className="inv-item-cell">
                            <div
                                style={{
                                    fontWeight: 700,
                                    color:
                                        item.id === selectedItem?.id
                                            ? C.accent
                                            : C.text,
                                }}
                            >
                                {item.item_name}
                            </div>
                            <span className="inv-meta">
                                Category: {item.category || "-"}
                            </span>
                        </div>,
                        <span style={{ fontWeight: 600 }}>
                            {item.quantity} {item.unit}
                        </span>,
                        <span className="inv-meta">
                            {item.minimum_threshold} {item.unit}
                        </span>,
                        <Badge
                            label={statusOf(item)}
                            color={badgeColor(statusOf(item))}
                        />,
                        item.last_updated,
                        <div className="inv-table-actions">
                            <Btn
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEditItem(item.id)
                                }}
                            >
                                Update
                            </Btn>
                            <Btn
                                size="sm"
                                variant="danger"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteItem(item.id)
                                }}
                            >
                                Delete
                            </Btn>
                        </div>,
                    ])}
                    onRowClick={(index) =>
                        setSelectedId(filteredItems[index].id)
                    }
                    emptyMessage="No matching inventory items."
                />
            </div>
        </section>
    )
}
