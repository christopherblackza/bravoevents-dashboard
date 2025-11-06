import { Event } from "./event.models";

export interface EventsResponse {
  page: number;
  limit: number;
  total: number;
  items: Event[];
}