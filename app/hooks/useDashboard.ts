import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { DashboardResponse } from "../types/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardResponse> => {
      const { data } = await api.get<DashboardResponse>("/dashboard");
      return data;
    },
    refetchInterval: 60_000, // refresh every minute so it stays roughly live
  });
}