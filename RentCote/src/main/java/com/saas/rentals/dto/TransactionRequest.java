package com.saas.rentals.dto;
import com.saas.rentals.model.TransactionStatus;
import com.saas.rentals.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionRequest(
    UUID rentalId, UUID contractId, UUID expenseTypeId,
    @NotNull BigDecimal amount,
    @NotNull TransactionType type,
    @NotNull TransactionStatus status,
    @NotNull LocalDate dueDate,
    LocalDate paymentDate,
    @NotBlank String description
) {}
