package com.filamentbarbaner.service;

import com.filamentbarbaner.dto.CreateReservationRequest;
import com.filamentbarbaner.dto.ReservationResponse;
import com.filamentbarbaner.model.Reservation;
import com.filamentbarbaner.model.ReservationStatus;
import com.filamentbarbaner.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    public ReservationResponse createReservation(CreateReservationRequest request) {
        Reservation reservation = fromRequest(request);
        reservation.setStatus(ReservationStatus.PENDING);
        Reservation savedReservation = reservationRepository.save(reservation);
        return toReservationResponse(savedReservation);
    }

    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::toReservationResponse)
                .collect(Collectors.toList());
    }

    public Optional<ReservationResponse> updateReservationStatus(UUID id, ReservationStatus status) {
        return reservationRepository.findById(id)
                .map(reservation -> {
                    reservation.setStatus(status);
                    Reservation updatedReservation = reservationRepository.save(reservation);
                    return toReservationResponse(updatedReservation);
                });
    }

    private ReservationResponse toReservationResponse(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getCustomerName(),
                reservation.getCustomerEmail(),
                reservation.getCustomerPhone(),
                reservation.getReservationTime(),
                reservation.getNumberOfGuests(),
                reservation.getStatus(),
                reservation.getSpecialRequests()
        );
    }

    private Reservation fromRequest(CreateReservationRequest request) {
        return Reservation.builder()
                .customerName(request.customerName())
                .customerEmail(request.customerEmail())
                .customerPhone(request.customerPhone())
                .reservationTime(request.reservationTime())
                .numberOfGuests(request.numberOfGuests())
                .specialRequests(request.specialRequests())
                .build();
    }
}