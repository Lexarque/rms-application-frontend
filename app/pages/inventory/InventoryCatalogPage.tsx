import React, { useState } from "react"
import { SectionHeader } from "../../components/ui/SectionHeader"
import { Modal } from "../../components/ui/Modal"
import { Btn } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { InventoryStyles } from "./styles"
import { CatalogTab } from "./components/CatalogTab"
import { AlertsTab } from "./components/AlertsTab"
import { useInventoryModule } from "./useInventoryModule"

export default function InventoryCatalogPage() {
    const inventory = useInventoryModule()
    const [editorOpen, setEditorOpen] = useState(false)

    const openCreate = () => {
        inventory.openAdd()
        setEditorOpen(true)
    }

    const closeEditor = () => {
        setEditorOpen(false)
    }

    const handleSave = async () => {
        const success = await inventory.saveDraft()
        if (success) {
            setEditorOpen(false)
        }
    }

    return (
        <div>
            <SectionHeader
                title="Inventory Catalog"
                subtitle="Items, status, and history"
            />

            {inventory.errorMessage && (
                <div className="inv-error">{inventory.errorMessage}</div>
            )}

            <div className="inv-kpi-row">
                <div className="inv-kpi-card">
                    <span>Total Units On Hand</span>
                    <strong>
                        {inventory.metrics.totalQty.toLocaleString()}
                    </strong>
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

            {/* ALERTS TAB MOVED HERE */}
            <div style={{ marginBottom: 14, marginTop: 14 }}>
                <AlertsTab
                    riskItems={inventory.items.filter(
                        (item) => item.quantity <= item.minimum_threshold,
                    )}
                    monthMovements={inventory.monthMovements}
                    items={inventory.items}
                    monthFilter={inventory.monthFilter}
                    setMonthFilter={inventory.setMonthFilter}
                />
            </div>

            {/* CATALOG TAB (ITEM REGISTRY) MOVED BELOW ALERTS */}
            <div className="inv-grid inv-catalog-grid">
                <CatalogTab
                    selectedItem={inventory.selectedItem}
                    filteredItems={inventory.filteredItems}
                    statusFilter={inventory.statusFilter}
                    query={inventory.query}
                    setStatusFilter={inventory.setStatusFilter}
                    setQuery={inventory.setQuery}
                    setSelectedId={inventory.setSelectedId}
                    onCreateItem={openCreate}
                    onEditItem={(id) => {
                        if (inventory.openEditItem(id)) {
                            setEditorOpen(true)
                        }
                    }}
                    onDeleteItem={(id) => {
                        const item = inventory.items.find(
                            (entry) => entry.id === id,
                        )
                        if (!item) return
                        if (window.confirm(`Delete ${item.item_name}?`)) {
                            void inventory.deleteInventoryById(id)
                        }
                    }}
                />
            </div>

            <Modal
                open={editorOpen}
                onClose={closeEditor}
                title={
                    inventory.draftMode === "add"
                        ? "Add Inventory Item"
                        : "Edit Inventory Item"
                }
            >
                <div style={{ display: "grid", gap: 12 }}>
                    <Input
                        label="Item Name"
                        required
                        value={inventory.draftItem.item_name}
                        onChange={(e) =>
                            inventory.setDraftItem((prev) => ({
                                ...prev,
                                item_name: e.target.value,
                            }))
                        }
                        placeholder="e.g. Olive Oil"
                    />
                    <div className="inv-form-grid">
                        <Input
                            type="number"
                            label="Quantity"
                            value={inventory.draftItem.quantity}
                            onChange={(e) => {
                                const value = e.target.value
                                inventory.setDraftItem((prev) => ({
                                    ...prev,
                                    quantity:
                                        value === ""
                                            ? ""
                                            : Math.max(0, Number(value) || 0),
                                }))
                            }}
                        />
                        <Input
                            type="number"
                            label="Minimum Threshold"
                            value={inventory.draftItem.minimum_threshold}
                            onChange={(e) => {
                                const value = e.target.value
                                inventory.setDraftItem((prev) => ({
                                    ...prev,
                                    minimum_threshold:
                                        value === ""
                                            ? ""
                                            : Math.max(0, Number(value) || 0),
                                }))
                            }}
                        />
                    </div>
                    <div className="inv-meta">
                        Updates name, quantity, and threshold.
                    </div>

                    <div
                        className="inv-actions"
                        style={{ justifyContent: "flex-end" }}
                    >
                        <Btn variant="ghost" onClick={closeEditor}>
                            Cancel
                        </Btn>
                        <Btn onClick={() => void handleSave()}>
                            {inventory.draftMode === "add"
                                ? "Create Item"
                                : "Save Changes"}
                        </Btn>
                    </div>
                </div>
            </Modal>

            <InventoryStyles />
        </div>
    )
}
