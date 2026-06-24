package com.filamentbarbaner.dto;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.filamentbarbaner.model.MenuItemCategory;

public record MenuItemDto(
    UUID id,
    @NotBlank String name,
    String description,
    @NotNull @Positive BigDecimal price,
    @NotNull MenuItemCategory category,
    String imageUrl,
    boolean isAvailable
) {}