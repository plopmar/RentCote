package com.saas.rentals.dto;

import com.saas.rentals.model.ContractStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContractRequest(
    @NotNull(message = "Rental ID is required")
    UUID rentalId,

    @NotNull(message = "Tenant ID is required")
    UUID tenantId,

    @NotNull(message = "Start date is required")
    LocalDate startDate,

    @NotNull(message = "End date is required")
    @FutureOrPresent(message = "End date must be in the present or future")
    LocalDate endDate,

    @NotNull(message = "Monthly rent is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rent must be greater than zero")
    BigDecimal monthlyRent,

    @NotNull(message = "Deposit is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Deposit cannot be negative")
    BigDecimal deposit,

    @NotNull(message = "Status is required")
    ContractStatus status
) {}
