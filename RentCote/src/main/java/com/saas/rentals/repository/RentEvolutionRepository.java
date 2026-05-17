package com.saas.rentals.repository;

import com.saas.rentals.model.RentEvolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RentEvolutionRepository extends JpaRepository<RentEvolution, UUID> {
    List<RentEvolution> findAllByContractIdOrderByStartDateDesc(UUID contractId);

    @Query("SELECT r FROM RentEvolution r WHERE r.contract.id = :contractId AND r.startDate <= :date ORDER BY r.startDate DESC LIMIT 1")
    Optional<RentEvolution> findCurrentRent(@Param("contractId") UUID contractId, @Param("date") LocalDate date);
}
