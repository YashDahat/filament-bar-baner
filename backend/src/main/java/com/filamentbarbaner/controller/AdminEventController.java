package com.filamentbarbaner.controller;

import com.filamentbarbaner.dto.EventDto;
import com.filamentbarbaner.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/events")
public class AdminEventController {

    private final EventService eventService;

    public AdminEventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<EventDto> createEvent(@Valid @RequestBody EventDto eventDto) {
        EventDto createdEvent = eventService.createEvent(eventDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable UUID id, @Valid @RequestBody EventDto eventDto) {
        return eventService.updateEvent(id, eventDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}