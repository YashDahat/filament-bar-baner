export interface EventDto {
  id?: string; // UUID, optional for new events
  name: string;
  description: string;
  eventDate: string; // ISO 8601 date-time string
  imageUrl?: string;
}

import { apiClient } from '../api/client';

export async function getEvents(): Promise<EventDto[]> {
  const response = await apiClient.get<EventDto[]>('/api/v1/events');
  return response.data;
}