import { api } from "../../lib/axios";

export type MenuCategory = "FOOD" | "BEVERAGE" | "DESSERT" | "SNACK" | "SET_MEAL" | "SEASONAL";

export const MENU_CATEGORIES: MenuCategory[] = [
  "FOOD", "BEVERAGE", "DESSERT", "SNACK", "SET_MEAL", "SEASONAL",
];

export const CATEGORY_LABELS: Record<MenuCategory, string> = {
  FOOD: "Food", BEVERAGE: "Beverage", DESSERT: "Dessert",
  SNACK: "Snack", SET_MEAL: "Set Meal", SEASONAL: "Seasonal",
};

export const CATEGORY_ICONS: Record<MenuCategory, string> = {
  FOOD: "🍛", BEVERAGE: "🥤", DESSERT: "🍰",
  SNACK: "🍟", SET_MEAL: "🍱", SEASONAL: "🌿",
};

export interface MenuIngredientInfo {
  id: string;
  inventoryId: string;
  inventoryItemName: string;
  quantityRequired: number;
  availableQuantity: number;
  sufficient: boolean;
}

export interface MenuItem {
  id: string;
  itemName: string;
  description?: string;
  price: number;
  category: MenuCategory;
  imageUrl?: string;
  isAvailable: boolean;
  stockAvailable: boolean;
  ingredients: MenuIngredientInfo[];
  lastUpdated?: string;
}

export interface CreateMenuItemRequest {
  itemName: string;
  description?: string;
  price: number;
  category?: MenuCategory;
  imageUrl?: string;
  isAvailable?: boolean;
}

export interface UpdateMenuItemRequest {
  itemName: string;
  description?: string;
  price: number;
  category?: MenuCategory;
  imageUrl?: string;
  isAvailable?: boolean;
}

export interface MenuIngredient {
  id: string;
  inventoryId: string;
  inventoryItemName: string;
  quantityRequired: number;
  availableQuantity: number;
  sufficient: boolean;
}

export async function fetchMenuItems(params?: {
  q?: string;
  isAvailable?: boolean;
  page?: number;
  size?: number;
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

export async function fetchMenuIngredients(menuId: string): Promise<MenuIngredient[]> {
  const res = await api.get(`/menu/${menuId}/ingredients`);
  return res.data;
}

export async function addMenuIngredient(menuId: string, data: {
  inventoryId: string;
  quantityRequired: number;
}) {
  const res = await api.post(`/menu/${menuId}/ingredients`, data);
  return res.data;
}

export async function deleteMenuIngredient(menuId: string, ingredientId: string) {
  await api.delete(`/menu/${menuId}/ingredients/${ingredientId}`);
}