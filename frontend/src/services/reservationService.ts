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

export const createReservation = async (data: CreateReservationRequest): Promise<ReservationResponse> => {
  const response = await apiClient.post<ReservationResponse>('/api/v1/reservations', data);
  return response.data;
};