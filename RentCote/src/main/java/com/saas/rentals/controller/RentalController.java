package com.saas.rentals.controller;

import com.saas.rentals.dto.RentalRequest;
import com.saas.rentals.dto.RentalResponse;
import com.saas.rentals.model.User;
import com.saas.rentals.service.RentalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @PostMapping
    public ResponseEntity<RentalResponse> createRental(
            @Valid @RequestBody RentalRequest request,
            @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(rentalService.createRental(request, user.getId()), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RentalResponse>> getAllRentals(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rentalService.getAllRentalsByOwner(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalResponse> getRentalById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rentalService.getRentalById(id, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRental(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        rentalService.deleteRental(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
