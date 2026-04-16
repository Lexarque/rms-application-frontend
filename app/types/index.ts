export type Role = "Manager" | "Staff" | "Kitchen";

export interface User {
  username: string;
  role: Role;
  name: string;
}

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  route: string;
}