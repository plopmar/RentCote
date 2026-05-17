package com.saas.rentals.dto;

import java.util.UUID;

public record TenantResponse(
    UUID id,
    UUID ownerId,
    String fullName,
    String email,
    String phone,
    String dniOrNie
) {}
