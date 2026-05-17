package com.saas.rentals.service;

import com.saas.rentals.dto.TransactionRequest;
import com.saas.rentals.dto.TransactionResponse;
import com.saas.rentals.exception.ResourceNotFoundException;
import com.saas.rentals.model.*;
import com.saas.rentals.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final RentalRepository rentalRepository;
    private final ContractRepository contractRepository;
    private final ExpenseTypeRepository expenseTypeRepository;
    private final RentEvolutionRepository rentEvolutionRepository;

    public TransactionResponse createTransaction(TransactionRequest request, UUID ownerId) {
        Rental rental = null;
        if (request.rentalId() != null)
            rental = rentalRepository.findByIdAndOwnerId(request.rentalId(), ownerId).orElseThrow(() -> new ResourceNotFoundException("Rental not found"));
        Contract contract = null;
        if (request.contractId() != null)
            contract = contractRepository.findByIdAndOwnerId(request.contractId(), ownerId).orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        ExpenseType expenseType = null;
        if (request.expenseTypeId() != null)
            expenseType = expenseTypeRepository.findByIdAndOwnerId(request.expenseTypeId(), ownerId).orElseThrow(() -> new ResourceNotFoundException("Expense type not found"));

        LocalDate paymentDate = request.paymentDate();
        if (request.status() == TransactionStatus.PAGADO && paymentDate == null) {
            paymentDate = LocalDate.now();
        }

        Transaction tx = Transaction.builder()
                .ownerId(ownerId).rental(rental).contract(contract).expenseType(expenseType)
                .amount(request.amount()).type(request.type()).status(request.status())
                .dueDate(request.dueDate()).paymentDate(paymentDate).description(request.description()).build();
        return mapToResponse(transactionRepository.save(tx));
    }

    public List<TransactionResponse> getAllTransactionsByOwner(UUID ownerId) {
        return transactionRepository.findAllByOwnerId(ownerId).stream().map(this::mapToResponse).toList();
    }

    public TransactionResponse getTransactionById(UUID id, UUID ownerId) {
        return mapToResponse(transactionRepository.findByIdAndOwnerId(id, ownerId).orElseThrow(() -> new ResourceNotFoundException("Transaction not found")));
    }

    public List<TransactionResponse> getLateTransactionsByOwner(UUID ownerId) {
        return transactionRepository.findAllByOwnerIdAndStatus(ownerId, TransactionStatus.ATRASADO).stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public TransactionResponse markAsPaid(UUID id, UUID ownerId) {
        Transaction tx = transactionRepository.findByIdAndOwnerId(id, ownerId).orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        tx.setStatus(TransactionStatus.PAGADO);
        tx.setPaymentDate(LocalDate.now());
        return mapToResponse(transactionRepository.save(tx));
    }

    @Transactional
    public TransactionResponse generateMonthlyReceipt(UUID contractId, UUID ownerId) {
        Contract contract = contractRepository.findByIdAndOwnerId(contractId, ownerId).orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        if (contract.getStatus() != ContractStatus.ACTIVE) throw new IllegalArgumentException("Contract is not active");

        // Look up the current rent from RentEvolution
        BigDecimal currentRent = rentEvolutionRepository.findCurrentRent(contractId, LocalDate.now())
                .map(RentEvolution::getAmount).orElse(contract.getMonthlyRent());

        Transaction tx = Transaction.builder()
                .ownerId(ownerId).rental(contract.getRental()).contract(contract)
                .amount(currentRent).type(TransactionType.INGRESO).status(TransactionStatus.PENDIENTE)
                .dueDate(LocalDate.now().plusDays(5))
                .description("Recibo mensual " + LocalDate.now().getMonth()).build();
        return mapToResponse(transactionRepository.save(tx));
    }

    @Transactional
    public void deleteTransaction(UUID id, UUID ownerId) {
        if (transactionRepository.findByIdAndOwnerId(id, ownerId).isEmpty()) throw new ResourceNotFoundException("Transaction not found");
        transactionRepository.deleteByIdAndOwnerId(id, ownerId);
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return new TransactionResponse(t.getId(), t.getOwnerId(),
                t.getRental() != null ? t.getRental().getId() : null,
                t.getContract() != null ? t.getContract().getId() : null,
                t.getExpenseType() != null ? t.getExpenseType().getId() : null,
                t.getExpenseType() != null ? t.getExpenseType().getName() : null,
                t.getAmount(), t.getType(), t.getStatus(), t.getDueDate(), t.getPaymentDate(), t.getDescription());
    }
}
