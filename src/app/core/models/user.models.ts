import { User } from "./auth.models";

export interface UserListResponse {
  page: number;
  limit: number;
  total: number;
  items: User[];
}