package com.filamentbarbaner.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record EventDto(
    UUID id,
    @NotBlank String name,
    @NotBlank String description,
    @NotNull @FutureOrPresent LocalDate eventDate,
    @NotNull LocalTime startTime,
    String imageUrl
) {}