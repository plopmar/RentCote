package com.saas.rentals.controller;

import com.saas.rentals.dto.TenantRequest;
import com.saas.rentals.dto.TenantResponse;
import com.saas.rentals.model.User;
import com.saas.rentals.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public ResponseEntity<TenantResponse> createTenant(
            @Valid @RequestBody TenantRequest request,
            @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(tenantService.createTenant(request, user.getId()), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TenantResponse>> getAllTenants(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(tenantService.getAllTenantsByOwner(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TenantResponse> getTenantById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(tenantService.getTenantById(id, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenant(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        tenantService.deleteTenant(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
