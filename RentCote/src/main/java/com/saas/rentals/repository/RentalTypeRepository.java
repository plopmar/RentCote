package com.saas.rentals.repository;

import com.saas.rentals.model.RentalType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RentalTypeRepository extends JpaRepository<RentalType, UUID> {
    List<RentalType> findAllByOwnerId(UUID ownerId);
    Optional<RentalType> findByIdAndOwnerId(UUID id, UUID ownerId);
}
