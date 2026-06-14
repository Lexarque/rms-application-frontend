import type { Role } from "./role";

export interface User {
  id: string;
  username: string;
  role: Role;
}