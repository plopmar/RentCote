package com.saas.rentals.service;

import com.saas.rentals.dto.TenantRequest;
import com.saas.rentals.dto.TenantResponse;
import com.saas.rentals.exception.ResourceNotFoundException;
import com.saas.rentals.model.Tenant;
import com.saas.rentals.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    public TenantResponse createTenant(TenantRequest request, UUID ownerId) {
        Tenant tenant = Tenant.builder()
                .ownerId(ownerId)
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .dniOrNie(request.dniOrNie())
                .build();

        return mapToResponse(tenantRepository.save(tenant));
    }

    public List<TenantResponse> getAllTenantsByOwner(UUID ownerId) {
        return tenantRepository.findAllByOwnerId(ownerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TenantResponse getTenantById(UUID id, UUID ownerId) {
        Tenant tenant = tenantRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found or access denied"));
        return mapToResponse(tenant);
    }

    @Transactional
    public void deleteTenant(UUID id, UUID ownerId) {
        if (tenantRepository.findByIdAndOwnerId(id, ownerId).isEmpty()) {
            throw new ResourceNotFoundException("Tenant not found or access denied");
        }
        tenantRepository.deleteByIdAndOwnerId(id, ownerId);
    }

    private TenantResponse mapToResponse(Tenant tenant) {
        return new TenantResponse(
                tenant.getId(),
                tenant.getOwnerId(),
                tenant.getFullName(),
                tenant.getEmail(),
                tenant.getPhone(),
                tenant.getDniOrNie()
        );
    }
}
