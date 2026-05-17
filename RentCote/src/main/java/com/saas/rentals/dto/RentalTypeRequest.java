package com.saas.rentals.dto;
import jakarta.validation.constraints.NotBlank;
public record RentalTypeRequest(@NotBlank(message = "Name is required") String name) {}
