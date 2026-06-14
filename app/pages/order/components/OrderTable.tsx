import React from "react";
import { Table } from "../../../components/ui/Table";
import { Badge } from "../../../components/ui/Badge";
import { Btn } from "../../../components/ui/Button";
import { font } from "../../../theme/tokens";
import type { OrderDto } from "~/types/order";
import { formatCurrency, formatDate, getStatusColor } from "../utils";

interface Props {
  orders: OrderDto[];
  onRowClick: (index: number) => void;
  onEdit: (id: string) => void;
}

export const OrderTable: React.FC<Props> = ({ orders, onRowClick, onEdit }) => {
  const columns = ["Order #", "Type", "Table", "Customer", "Amount", "Status", "Actions"];

  const rows = orders.map((order) => [
    <span key={`${order.id}-num`} style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500 }}>
      #{order.orderNumber}
    </span>,
    <span key={`${order.id}-type`} style={{ fontFamily: font.body, fontSize: 13 }}>
      {order.type === "DINE_IN" ? "Dine-in" : "Reservation"}
    </span>,
    <span key={`${order.id}-table`} style={{ fontFamily: font.body, fontSize: 13 }}>
      {order.tableNumber}
    </span>,
    <span key={`${order.id}-cust`} style={{ fontFamily: font.body, fontSize: 13 }}>
      {order.customerName ?? "-"}
    </span>,
    <span key={`${order.id}-amt`} style={{ fontFamily: font.body, fontSize: 13 }}>
      {formatCurrency(order.totalAmount)}
    </span>,
    <Badge key={`${order.id}-status`} label={order.status} color={getStatusColor(order.status)} />,
    <Btn
      key={`${order.id}-btn`}
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(order.id);
      }}
    >
      Edit
    </Btn>,
  ]);

  return <Table columns={columns} rows={rows} onRowClick={onRowClick} />;
};