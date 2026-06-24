package com.filamentbarbaner.dto;

public record AuthResponse(
    String token,
    String role,
    long expiresAt
) {}