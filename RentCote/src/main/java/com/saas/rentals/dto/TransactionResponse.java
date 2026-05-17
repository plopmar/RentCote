package com.saas.rentals.dto;
import com.saas.rentals.model.TransactionStatus;
import com.saas.rentals.model.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionResponse(
    UUID id, UUID ownerId, UUID rentalId, UUID contractId,
    UUID expenseTypeId, String expenseTypeName,
    BigDecimal amount, TransactionType type, TransactionStatus status,
    LocalDate dueDate, LocalDate paymentDate, String description
) {}
