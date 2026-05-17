package com.saas.rentals.dto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
public record RentEvolutionRequest(
    @NotNull BigDecimal amount,
    @NotNull LocalDate startDate,
    String description
) {}
