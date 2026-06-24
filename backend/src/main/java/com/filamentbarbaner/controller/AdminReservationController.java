package com.filamentbarbaner.controller;

import com.filamentbarbaner.dto.ReservationResponse;
import com.filamentbarbaner.model.ReservationStatus;
import com.filamentbarbaner.service.ReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/reservations")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReservationController {

    private final ReservationService reservationService;

    public AdminReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    private static record UpdateStatusRequest(ReservationStatus status) {}

    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        List<ReservationResponse> reservations = reservationService.getAllReservations();
        return new ResponseEntity<>(reservations, HttpStatus.OK);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReservationResponse> updateReservationStatus(@PathVariable("id") UUID id, @RequestBody UpdateStatusRequest request) {
        return reservationService.updateReservationStatus(id, request.status())
                .map(reservationResponse -> new ResponseEntity<>(reservationResponse, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}