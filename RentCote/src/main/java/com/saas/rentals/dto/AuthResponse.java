package com.saas.rentals.dto;

import java.util.UUID;

public record AuthResponse(
    UUID id,
    String name,
    String email,
    String token
) {}
