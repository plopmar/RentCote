package com.saas.rentals.repository;

import com.saas.rentals.model.Transaction;
import com.saas.rentals.model.TransactionStatus;
import com.saas.rentals.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findAllByOwnerId(UUID ownerId);
    Optional<Transaction> findByIdAndOwnerId(UUID id, UUID ownerId);
    void deleteByIdAndOwnerId(UUID id, UUID ownerId);

    List<Transaction> findAllByOwnerIdAndStatus(UUID ownerId, TransactionStatus status);

    @Query("SELECT SUM(t.amount) FROM Transaction t " +
           "WHERE t.ownerId = :ownerId " +
           "AND t.type = :type " +
           "AND t.status = :status " +
           "AND EXTRACT(MONTH FROM t.dueDate) = :month " +
           "AND EXTRACT(YEAR FROM t.dueDate) = :year")
    BigDecimal sumAmountByOwnerIdAndTypeAndStatusAndMonthYear(
            @Param("ownerId") UUID ownerId,
            @Param("type") TransactionType type,
            @Param("status") TransactionStatus status,
            @Param("month") int month,
            @Param("year") int year
    );

    @Query("SELECT SUM(t.amount) FROM Transaction t " +
           "WHERE t.ownerId = :ownerId " +
           "AND t.type = :type " +
           "AND EXTRACT(MONTH FROM t.dueDate) = :month " +
           "AND EXTRACT(YEAR FROM t.dueDate) = :year")
    BigDecimal sumAmountByOwnerIdAndTypeAndMonthYear(
            @Param("ownerId") UUID ownerId,
            @Param("type") TransactionType type,
            @Param("month") int month,
            @Param("year") int year
    );

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.ownerId = :ownerId AND t.type = :type AND t.status = :status")
    BigDecimal sumAmountByOwnerIdAndTypeAndStatus(
            @Param("ownerId") UUID ownerId,
            @Param("type") TransactionType type,
            @Param("status") TransactionStatus status
    );

    List<Transaction> findTop5ByOwnerIdOrderByDueDateDesc(UUID ownerId);

    @Query("SELECT t.expenseType.name, SUM(t.amount) FROM Transaction t " +
           "WHERE t.ownerId = :ownerId AND t.type = 'GASTO' " +
           "GROUP BY t.expenseType.name")
    List<Object[]> sumAmountByOwnerIdGroupByCategory(@Param("ownerId") UUID ownerId);
}
