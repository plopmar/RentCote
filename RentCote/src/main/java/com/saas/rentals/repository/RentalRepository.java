package com.saas.rentals.repository;

import com.saas.rentals.model.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RentalRepository extends JpaRepository<Rental, UUID> {
    List<Rental> findAllByOwnerId(UUID ownerId);
    Optional<Rental> findByIdAndOwnerId(UUID id, UUID ownerId);
    void deleteByIdAndOwnerId(UUID id, UUID ownerId);
    long countByOwnerId(UUID ownerId);
    long countByOwnerIdAndStatus(UUID ownerId, String status);
}
