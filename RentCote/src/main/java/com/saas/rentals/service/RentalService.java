package com.saas.rentals.service;

import com.saas.rentals.dto.RentalRequest;
import com.saas.rentals.dto.RentalResponse;
import com.saas.rentals.exception.ResourceNotFoundException;
import com.saas.rentals.model.Rental;
import com.saas.rentals.model.RentalType;
import com.saas.rentals.repository.RentalRepository;
import com.saas.rentals.repository.RentalTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class RentalService {
    private final RentalRepository rentalRepository;
    private final RentalTypeRepository rentalTypeRepository;

    public RentalResponse createRental(RentalRequest request, UUID ownerId) {
        RentalType rt = rentalTypeRepository.findByIdAndOwnerId(request.rentalTypeId(), ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental type not found"));
        Rental rental = Rental.builder()
                .ownerId(ownerId).name(request.name()).address(request.address())
                .rentalType(rt).monthlyPrice(request.monthlyPrice())
                .status("VACÍO").attributes(request.attributes()).build();
        return mapToResponse(rentalRepository.save(rental));
    }

    public List<RentalResponse> getAllRentalsByOwner(UUID ownerId) {
        return rentalRepository.findAllByOwnerId(ownerId).stream().map(this::mapToResponse).toList();
    }

    public RentalResponse getRentalById(UUID id, UUID ownerId) {
        return mapToResponse(rentalRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found")));
    }

    @Transactional
    public void deleteRental(UUID id, UUID ownerId) {
        if (rentalRepository.findByIdAndOwnerId(id, ownerId).isEmpty()) throw new ResourceNotFoundException("Rental not found");
        rentalRepository.deleteByIdAndOwnerId(id, ownerId);
    }

    private RentalResponse mapToResponse(Rental r) {
        return new RentalResponse(r.getId(), r.getOwnerId(), r.getName(), r.getAddress(),
                r.getRentalType() != null ? r.getRentalType().getId() : null,
                r.getRentalType() != null ? r.getRentalType().getName() : "Sin tipo",
                r.getMonthlyPrice(), r.getStatus(), r.getAttributes());
    }
}
