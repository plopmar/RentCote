package com.saas.rentals.dto;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record RentalResponse(
    UUID id, UUID ownerId, String name, String address,
    UUID rentalTypeId, String rentalTypeName,
    BigDecimal monthlyPrice, BigDecimal purchasePrice, String status,
    Map<String, Object> attributes
) {}
