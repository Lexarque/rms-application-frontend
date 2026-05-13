import { api } from "../lib/axios";

export interface StaffMember {
  id: number;
  name: string;
  role: "Manager" | "Staff";
  phone_number: string;
}

export const staffApi = {
  getAll: async (): Promise<StaffMember[]> => {
    const { data } = await api.get("/staff");
    return data;
  },
};