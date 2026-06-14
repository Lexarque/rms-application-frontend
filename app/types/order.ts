export type OrderType = "DINE_IN" | "RESERVATION";

export type OrderStatus =
  | "DRAFT"
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItemDto {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  priceAtOrder: number;
  customInstructions: string | null;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  tableId: string;
  tableNumber: string;
  reservationId: string | null;
  customerId: string | null;
  customerName: string | null;
  staffId: string | null;
  staffName: string | null;
  specialRequests: string | null;
  totalAmount: number | null;
  items: OrderItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemRequest {
  menuItemId: string;
  quantity: number;
  customInstructions?: string;
}

export interface CreateOrderRequest {
  type: OrderType;
  tableId: string;
  reservationId?: string;
  customerId?: string;
  staffId?: string;
  specialRequests?: string;
  items?: CreateOrderItemRequest[];
}

export interface UpdateOrderRequest {
  tableId?: string;
  specialRequests?: string;
  staffId?: string;
  items?: CreateOrderItemRequest[];
}

export interface StatusChangeRequest {
  status: OrderStatus;
  staffId?: string;
}

export interface OrderListParams {
  q?: string;
  status?: OrderStatus;
  type?: OrderType;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface OrderSession {
  tableId: string;
  tableNumber: string;
  type: OrderType;
}