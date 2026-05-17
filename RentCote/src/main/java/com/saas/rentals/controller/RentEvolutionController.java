package com.saas.rentals.controller;

import com.saas.rentals.dto.*; import com.saas.rentals.model.RentEvolution; import com.saas.rentals.model.User;
import com.saas.rentals.exception.ResourceNotFoundException;
import com.saas.rentals.repository.ContractRepository; import com.saas.rentals.repository.RentEvolutionRepository;
import jakarta.validation.Valid; import lombok.RequiredArgsConstructor;
import org.springframework.http.*; import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List; import java.util.UUID;

@RestController @RequestMapping("/api/v1/contracts/{contractId}/rent-history") @RequiredArgsConstructor
public class RentEvolutionController {
    private final RentEvolutionRepository repo;
    private final ContractRepository contractRepo;

    @PostMapping
    public ResponseEntity<RentEvolutionResponse> add(@PathVariable UUID contractId, @Valid @RequestBody RentEvolutionRequest req, @AuthenticationPrincipal User user) {
        var contract = contractRepo.findByIdAndOwnerId(contractId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        RentEvolution re = RentEvolution.builder().contract(contract).amount(req.amount()).startDate(req.startDate()).description(req.description()).build();
        RentEvolution saved = repo.save(re);
        return new ResponseEntity<>(new RentEvolutionResponse(saved.getId(), contractId, saved.getAmount(), saved.getStartDate(), saved.getDescription()), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RentEvolutionResponse>> getAll(@PathVariable UUID contractId, @AuthenticationPrincipal User user) {
        contractRepo.findByIdAndOwnerId(contractId, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        return ResponseEntity.ok(repo.findAllByContractIdOrderByStartDateDesc(contractId).stream()
                .map(r -> new RentEvolutionResponse(r.getId(), contractId, r.getAmount(), r.getStartDate(), r.getDescription())).toList());
    }
}
