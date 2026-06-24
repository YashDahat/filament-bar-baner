package com.filamentbarbaner.controller;

import com.filamentbarbaner.dto.EventDto;
import com.filamentbarbaner.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<EventDto>> getUpcomingEvents() {
        List<EventDto> upcomingEvents = eventService.getUpcomingEvents();
        return ResponseEntity.ok(upcomingEvents);
    }
}