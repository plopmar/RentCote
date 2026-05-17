package com.saas.rentals.controller;

import com.saas.rentals.dto.ContractRequest;
import com.saas.rentals.dto.ContractResponse;
import com.saas.rentals.model.User;
import com.saas.rentals.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/contracts") @RequiredArgsConstructor
public class ContractController {
    private final ContractService contractService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDirProperty;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContractResponse> createWithFile(
            @RequestPart("contract") @Valid ContractRequest request,
            @RequestPart(value = "pdf", required = false) MultipartFile pdf,
            @AuthenticationPrincipal User user) throws IOException {
        String pdfUrl = null;
        if (pdf != null && !pdf.isEmpty()) {
            Path dir = Paths.get(uploadDirProperty, "contracts");
            Files.createDirectories(dir);
            String filename = UUID.randomUUID() + "_" + pdf.getOriginalFilename();
            Files.copy(pdf.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            pdfUrl = "/uploads/contracts/" + filename;
        }
        return new ResponseEntity<>(contractService.createContract(request, user.getId(), pdfUrl), HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ContractResponse> createJson(@Valid @RequestBody ContractRequest request, @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(contractService.createContract(request, user.getId(), null), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContractResponse> updateWithFile(
            @PathVariable UUID id,
            @RequestPart("contract") @Valid ContractRequest request,
            @RequestPart(value = "pdf", required = false) MultipartFile pdf,
            @AuthenticationPrincipal User user) throws IOException {
        String pdfUrl = null;
        if (pdf != null && !pdf.isEmpty()) {
            Path dir = Paths.get(uploadDirProperty, "contracts");
            Files.createDirectories(dir);
            String filename = UUID.randomUUID() + "_" + pdf.getOriginalFilename();
            Files.copy(pdf.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            pdfUrl = "/uploads/contracts/" + filename;
        }
        return ResponseEntity.ok(contractService.updateContract(id, request, user.getId(), pdfUrl));
    }

    @PostMapping("/{id}/terminate")
    public ResponseEntity<ContractResponse> terminate(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(contractService.terminateContract(id, user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<ContractResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(contractService.getAllContractsByOwner(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractResponse> getById(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(contractService.getContractById(id, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        contractService.deleteContract(id, user.getId()); return ResponseEntity.noContent().build();
    }
}
