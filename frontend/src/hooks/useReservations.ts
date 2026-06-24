import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { createReservation, CreateReservationRequest, ReservationResponse } from '../services/reservationService';

export const useCreateReservation = (): UseMutationResult<ReservationResponse, Error, CreateReservationRequest> => {
  return useMutation<ReservationResponse, Error, CreateReservationRequest>({
    mutationFn: createReservation,
  });
};