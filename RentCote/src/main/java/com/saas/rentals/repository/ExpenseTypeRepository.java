package com.saas.rentals.repository;

import com.saas.rentals.model.ExpenseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseTypeRepository extends JpaRepository<ExpenseType, UUID> {
    List<ExpenseType> findAllByOwnerId(UUID ownerId);
    Optional<ExpenseType> findByIdAndOwnerId(UUID id, UUID ownerId);
}
