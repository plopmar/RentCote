package com.saas.rentals.controller;

import com.saas.rentals.dto.*; import com.saas.rentals.model.User; import com.saas.rentals.service.ExpenseTypeService;
import jakarta.validation.Valid; import lombok.RequiredArgsConstructor;
import org.springframework.http.*; import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/expense-types") @RequiredArgsConstructor
public class ExpenseTypeController {
    private final ExpenseTypeService service;

    @PostMapping
    public ResponseEntity<ExpenseTypeResponse> create(@Valid @RequestBody ExpenseTypeRequest req, @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(service.create(req, user.getId()), HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<ExpenseTypeResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getAll(user.getId()));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        service.delete(id, user.getId()); return ResponseEntity.noContent().build();
    }
}
