export interface DashboardResponse {
  staff: StaffStats | null;
  orders: OrderStats;
  menu: MenuStats;
  inventory: InventoryStats;
}

export interface StaffStats {
  total: number;
  byRole: Record<string, number>;
}

export interface OrderStats {
  todayCount: number;
  todayRevenue: number;
  activeCount: number;
  byStatus: Record<string, number>;
}

export interface MenuStats {
  total: number;
  availableCount: number;
  outOfStockCount: number;
}

export interface InventoryStats {
  total: number;
  lowStockCount: number;
}