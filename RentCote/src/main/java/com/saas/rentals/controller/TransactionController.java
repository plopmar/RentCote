package com.saas.rentals.controller;

import com.saas.rentals.dto.TransactionRequest;
import com.saas.rentals.dto.TransactionResponse;
import com.saas.rentals.model.User;
import com.saas.rentals.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(transactionService.createTransaction(request, user.getId()), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transactionService.getAllTransactionsByOwner(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transactionService.getTransactionById(id, user.getId()));
    }

    @GetMapping("/late")
    public ResponseEntity<List<TransactionResponse>> getLateTransactions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transactionService.getLateTransactionsByOwner(user.getId()));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<TransactionResponse> markAsPaid(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transactionService.markAsPaid(id, user.getId()));
    }

    @PostMapping("/generate-receipt/{contractId}")
    public ResponseEntity<TransactionResponse> generateMonthlyReceipt(
            @PathVariable UUID contractId,
            @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(transactionService.generateMonthlyReceipt(contractId, user.getId()), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        transactionService.deleteTransaction(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
