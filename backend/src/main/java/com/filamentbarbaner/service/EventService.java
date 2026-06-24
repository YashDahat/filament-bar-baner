package com.filamentbarbaner.service;

import com.filamentbarbaner.repository.EventRepository;
import com.filamentbarbaner.dto.EventDto;
import com.filamentbarbaner.model.Event;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<EventDto> getUpcomingEvents() {
        LocalDate date = LocalDate.now().minusDays(1);
        return eventRepository.findAllByEventDateAfter(date)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public EventDto createEvent(EventDto eventDto) {
        Event event = toEntity(eventDto);
        Event savedEvent = eventRepository.save(event);
        return toDto(savedEvent);
    }

    public Optional<EventDto> updateEvent(UUID id, EventDto eventDto) {
        return eventRepository.findById(id)
                .map(existingEvent -> {
                    existingEvent.setName(eventDto.name());
                    existingEvent.setDescription(eventDto.description());
                    existingEvent.setEventDate(eventDto.eventDate());
                    existingEvent.setStartTime(eventDto.startTime());
                    existingEvent.setImageUrl(eventDto.imageUrl());
                    Event updatedEvent = eventRepository.save(existingEvent);
                    return toDto(updatedEvent);
                });
    }

    public void deleteEvent(UUID id) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    private EventDto toDto(Event event) {
        return new EventDto(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getEventDate(),
                event.getStartTime(),
                event.getImageUrl()
        );
    }

    private Event toEntity(EventDto eventDto) {
        return new Event(
                eventDto.id(),
                eventDto.name(),
                eventDto.description(),
                eventDto.eventDate(),
                eventDto.startTime(),
                eventDto.imageUrl()
        );
    }
}