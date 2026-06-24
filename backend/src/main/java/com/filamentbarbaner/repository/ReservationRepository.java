package com.filamentbarbaner.repository;

import com.filamentbarbaner.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    List<Reservation> findByReservationTimeBetween(LocalDateTime start, LocalDateTime end);
}