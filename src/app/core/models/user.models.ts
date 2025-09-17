import { User } from "./auth.models";

export interface UserListResponse {
  message: string;
  userData: User[];
}