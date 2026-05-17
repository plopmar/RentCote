package com.saas.rentals.service;

import com.saas.rentals.dto.ContractRequest;
import com.saas.rentals.dto.ContractResponse;
import com.saas.rentals.exception.ResourceNotFoundException;
import com.saas.rentals.model.*;
import com.saas.rentals.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class ContractService {
    private final ContractRepository contractRepository;
    private final RentalRepository rentalRepository;
    private final TenantRepository tenantRepository;
    private final RentEvolutionRepository rentEvolutionRepository;

    @Transactional
    public ContractResponse createContract(ContractRequest request, UUID ownerId, String pdfUrl) {
        if (request.endDate().isBefore(request.startDate()))
            throw new IllegalArgumentException("End date must be after start date");

        Rental rental = rentalRepository.findByIdAndOwnerId(request.rentalId(), ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found"));
        Tenant tenant = tenantRepository.findByIdAndOwnerId(request.tenantId(), ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        boolean collision = contractRepository.existsOverlappingContract(
                rental.getId(), request.startDate(), request.endDate(),
                List.of(ContractStatus.ACTIVE, ContractStatus.PENDING));
        if (collision) throw new IllegalArgumentException("Overlapping contract exists");

        Contract contract = Contract.builder()
                .ownerId(ownerId).rental(rental).tenant(tenant)
                .startDate(request.startDate()).endDate(request.endDate())
                .monthlyRent(request.monthlyRent()).deposit(request.deposit())
                .status(request.status()).pdfUrl(pdfUrl).build();
        Contract saved = contractRepository.save(contract);

        // Create initial rent evolution entry
        RentEvolution re = RentEvolution.builder()
                .contract(saved).amount(request.monthlyRent())
                .startDate(request.startDate()).description("Initial rent").build();
        rentEvolutionRepository.save(re);

        // Mark rental as occupied if contract is ACTIVE
        if (request.status() == ContractStatus.ACTIVE) {
            rental.setStatus("OCUPADO");
            rentalRepository.save(rental);
        }
        return mapToResponse(saved);
    }

    @Transactional
    public ContractResponse terminateContract(UUID id, UUID ownerId) {
        Contract contract = contractRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        contract.setStatus(ContractStatus.TERMINATED);
        contract.setEndDate(LocalDate.now());
        contractRepository.save(contract);

        Rental rental = contract.getRental();
        rental.setStatus("VACÍO");
        rentalRepository.save(rental);
        return mapToResponse(contract);
    }

    @Transactional
    public ContractResponse updateContract(UUID id, ContractRequest request, UUID ownerId, String newPdfUrl) {
        Contract contract = contractRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (request.endDate().isBefore(request.startDate()))
            throw new IllegalArgumentException("End date must be after start date");

        Rental rental = rentalRepository.findByIdAndOwnerId(request.rentalId(), ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found"));
        Tenant tenant = tenantRepository.findByIdAndOwnerId(request.tenantId(), ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        contract.setRental(rental);
        contract.setTenant(tenant);
        contract.setStartDate(request.startDate());
        contract.setEndDate(request.endDate());
        contract.setMonthlyRent(request.monthlyRent());
        contract.setDeposit(request.deposit());
        contract.setStatus(request.status());
        
        if (newPdfUrl != null) {
            contract.setPdfUrl(newPdfUrl);
        }

        return mapToResponse(contractRepository.save(contract));
    }

    public List<ContractResponse> getAllContractsByOwner(UUID ownerId) {
        return contractRepository.findAllByOwnerId(ownerId).stream().map(this::mapToResponse).toList();
    }

    public ContractResponse getContractById(UUID id, UUID ownerId) {
        return mapToResponse(contractRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found")));
    }

    @Transactional
    public void deleteContract(UUID id, UUID ownerId) {
        if (contractRepository.findByIdAndOwnerId(id, ownerId).isEmpty()) throw new ResourceNotFoundException("Contract not found");
        contractRepository.deleteByIdAndOwnerId(id, ownerId);
    }

    private ContractResponse mapToResponse(Contract c) {
        return new ContractResponse(c.getId(), c.getOwnerId(), 
                c.getRental().getId(), c.getRental().getName(),
                c.getTenant().getId(), c.getTenant().getFullName(),
                c.getStartDate(), c.getEndDate(), c.getMonthlyRent(), c.getDeposit(), c.getStatus(), c.getPdfUrl());
    }
}
