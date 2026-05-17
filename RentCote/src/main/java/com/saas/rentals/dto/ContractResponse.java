package com.saas.rentals.dto;
import com.saas.rentals.model.ContractStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContractResponse(
    UUID id, UUID ownerId, UUID rentalId, String rentalName, UUID tenantId, String tenantName,
    LocalDate startDate, LocalDate endDate,
    BigDecimal monthlyRent, BigDecimal deposit,
    ContractStatus status, String pdfUrl
) {}
