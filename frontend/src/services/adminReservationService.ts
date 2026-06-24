export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface CreateReservationRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationTime: string; // ISO 8601 format (e.g., '2024-09-15T19:30:00')
  partySize: number;
  specialRequests?: string;
}

export interface ReservationResponse {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationTime: string; // ISO 8601 format
  partySize: number;
  status: ReservationStatus;
  specialRequests?: string;
}

import { apiClient } from '@/api/client';

export const getAllReservations = async (): Promise<ReservationResponse[]> => {
  const response = await apiClient.get<ReservationResponse[]>('/api/v1/admin/reservations');
  return response.data;
};

export const updateReservationStatus = async (id: string, status: string): Promise<ReservationResponse> => {
  const response = await apiClient.put<ReservationResponse>(`/api/v1/admin/reservations/${id}/status`, { status });
  return response.data;
};