package com.filamentbarbaner.dto;

import com.filamentbarbaner.model.ReservationStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record ReservationResponse(
    UUID id,
    String customerName,
    String customerEmail,
    String customerPhone,
    LocalDateTime reservationTime,
    int numberOfGuests,
    ReservationStatus status,
    String specialRequests
) {}