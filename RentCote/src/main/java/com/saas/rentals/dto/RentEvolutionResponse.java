package com.saas.rentals.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
public record RentEvolutionResponse(UUID id, UUID contractId, BigDecimal amount, LocalDate startDate, String description) {}
