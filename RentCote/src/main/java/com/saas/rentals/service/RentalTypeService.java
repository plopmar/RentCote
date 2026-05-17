package com.saas.rentals.service;

import com.saas.rentals.dto.*; import com.saas.rentals.model.RentalType; import com.saas.rentals.repository.RentalTypeRepository;
import com.saas.rentals.exception.ResourceNotFoundException; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List; import java.util.UUID;

@Service @RequiredArgsConstructor
public class RentalTypeService {
    private final RentalTypeRepository repo;

    public RentalTypeResponse create(RentalTypeRequest req, UUID ownerId) {
        RentalType t = RentalType.builder().ownerId(ownerId).name(req.name()).build();
        RentalType saved = repo.save(t);
        return new RentalTypeResponse(saved.getId(), saved.getName());
    }

    @Transactional
    public List<RentalTypeResponse> getAll(UUID ownerId) {
        List<RentalType> types = repo.findAllByOwnerId(ownerId);
        if (types.isEmpty()) {
            // Seed defaults
            List<String> defaults = List.of("Vivienda", "Local", "Trastero", "Parking");
            defaults.forEach(d -> repo.save(RentalType.builder().ownerId(ownerId).name(d).build()));
            repo.flush();
            types = repo.findAllByOwnerId(ownerId);
        }
        return types.stream().map(t -> new RentalTypeResponse(t.getId(), t.getName())).toList();
    }

    public void delete(UUID id, UUID ownerId) {
        repo.findByIdAndOwnerId(id, ownerId).orElseThrow(() -> new ResourceNotFoundException("Rental type not found"));
        repo.deleteById(id);
    }
}
