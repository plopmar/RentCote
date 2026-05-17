package com.saas.rentals.controller;

import com.saas.rentals.dto.*; import com.saas.rentals.model.User; import com.saas.rentals.service.RentalTypeService;
import jakarta.validation.Valid; import lombok.RequiredArgsConstructor;
import org.springframework.http.*; import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/rental-types") @RequiredArgsConstructor
public class RentalTypeController {
    private final RentalTypeService service;

    @PostMapping
    public ResponseEntity<RentalTypeResponse> create(@Valid @RequestBody RentalTypeRequest req, @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(service.create(req, user.getId()), HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<RentalTypeResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getAll(user.getId()));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        service.delete(id, user.getId()); return ResponseEntity.noContent().build();
    }
}
