export interface EventDto {
  id?: string; // UUID, optional for new events
  name: string;
  description: string;
  eventDate: string; // ISO 8601 date-time string
  imageUrl?: string;
}

import { apiClient } from '../api/client';

export const createEvent = async (event: EventDto): Promise<EventDto> => {
  const response = await apiClient.post<EventDto>('/api/v1/admin/events', event);
  return response.data;
};

export const updateEvent = async (id: string, event: EventDto): Promise<EventDto> => {
  const response = await apiClient.put<EventDto>(`/api/v1/admin/events/${id}`, event);
  return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/admin/events/${id}`);
};