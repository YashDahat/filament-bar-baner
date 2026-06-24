package com.filamentbarbaner.controller;

import com.filamentbarbaner.dto.CreateReservationRequest;
import com.filamentbarbaner.dto.ReservationResponse;
import com.filamentbarbaner.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ReservationResponse> submitReservation(@Valid @RequestBody CreateReservationRequest request) {
        ReservationResponse createdReservation = reservationService.createReservation(request);
        return new ResponseEntity<>(createdReservation, HttpStatus.CREATED);
    }
}