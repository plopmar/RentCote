package com.saas.rentals.repository;

import com.saas.rentals.model.Contract;
import com.saas.rentals.model.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractRepository extends JpaRepository<Contract, UUID> {
    List<Contract> findAllByOwnerId(UUID ownerId);
    Optional<Contract> findByIdAndOwnerId(UUID id, UUID ownerId);
    void deleteByIdAndOwnerId(UUID id, UUID ownerId);
    long countByOwnerIdAndStatus(UUID ownerId, ContractStatus status);

    @Query("SELECT SUM(c.monthlyRent) FROM Contract c WHERE c.ownerId = :ownerId AND c.status = :status")
    BigDecimal sumMonthlyRentByOwnerIdAndStatus(@Param("ownerId") UUID ownerId, @Param("status") ContractStatus status);

    @Query("SELECT COUNT(c) > 0 FROM Contract c WHERE c.rental.id = :rentalId " +
           "AND c.status IN (:statuses) " +
           "AND (c.startDate <= :endDate AND c.endDate >= :startDate)")
    boolean existsOverlappingContract(
            @Param("rentalId") UUID rentalId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") List<ContractStatus> statuses
    );

    List<Contract> findAllByOwnerIdAndStatusAndEndDateBetween(UUID ownerId, ContractStatus status, LocalDate start, LocalDate end);
}
