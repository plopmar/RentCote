package com.saas.rentals.dto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record RentalRequest(
    @NotBlank(message = "Name is required") String name,
    @NotBlank(message = "Address is required") String address,
    @NotNull(message = "Rental type is required") UUID rentalTypeId,
    @NotNull(message = "Monthly price is required") @DecimalMin(value = "0.0", inclusive = false) BigDecimal monthlyPrice,
    Map<String, Object> attributes
) {}
