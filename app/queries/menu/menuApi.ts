import { api } from "../../lib/axios";

/* =========================
   TYPES
========================= */

export interface MenuItem {
  id: string;
  item_name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  last_updated?: string;
}

export interface CreateMenuItemRequest {
  item_name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
}

export interface UpdateMenuItemRequest {
  item_name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
}

export interface MenuIngredient {
  id: string;
  inventory_item_id: string;
  inventory_item_name: string;
  quantity_required: number;
}

/* =========================
   MENU ITEMS
========================= */

export async function fetchMenuItems(params?: {
  q?: string;
  isAvailable?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<MenuItem[]> {
  const res = await api.get("/menu", { params });
  return res.data;
}

export async function fetchMenuItem(id: string): Promise<MenuItem> {
  const res = await api.get(`/menu/${id}`);
  return res.data;
}

export async function createMenuItem(data: CreateMenuItemRequest) {
  const res = await api.post("/menu", data);
  return res.data;
}

export async function updateMenuItem(id: string, data: UpdateMenuItemRequest) {
  const res = await api.put(`/menu/${id}`, data);
  return res.data;
}

export async function deleteMenuItem(id: string) {
  await api.delete(`/menu/${id}`);
}

/* =========================
   INGREDIENTS
========================= */

export async function fetchMenuIngredients(menuId: string) {
  const res = await api.get(`/menu/${menuId}/ingredients`);
  return res.data;
}

export async function addMenuIngredient(
  menuId: string,
  data: {
    inventory_item_id: string;
    quantity_required: number;
  }
) {
  const res = await api.post(`/menu/${menuId}/ingredients`, data);
  return res.data;
}

export async function deleteMenuIngredient(
  menuId: string,
  ingredientId: string
) {
  await api.delete(`/menu/${menuId}/ingredients/${ingredientId}`);
}