import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { OrderDto, OrderListParams, OrderStatus, OrderType } from "../types/order";

const fetchOrders = async (params: OrderListParams): Promise<OrderDto[]> => {
  const { data } = await api.get<OrderDto[]>("/orders", { params });
  return [...data].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export function useOrders() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<OrderType | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params: OrderListParams = {
    q: debouncedSearch || undefined,
    status: statusFilter,
    type: typeFilter,
    page,
    size,
    sort: "created_at,desc",
  };

  const query = useQuery({
    queryKey: ["orders", params],
    queryFn: () => fetchOrders(params),
    placeholderData: (prev) => prev,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  return {
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    page,
    setPage,
    size,
    setSize,
    ...query,
  };
}