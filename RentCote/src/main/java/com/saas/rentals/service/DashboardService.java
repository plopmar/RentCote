package com.saas.rentals.service;

import com.saas.rentals.dto.DashboardResponse;
import com.saas.rentals.dto.TransactionResponse;
import com.saas.rentals.model.*;
import com.saas.rentals.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class DashboardService {
    private final RentalRepository rentalRepository;
    private final TransactionRepository transactionRepository;
    private final ContractRepository contractRepository;
    private final IncidentRepository incidentRepository;

    public DashboardResponse getDashboardMetrics(UUID ownerId) {
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue(), year = now.getYear();

        // 1. Total Portfolio Stats
        long totalRentals = rentalRepository.countByOwnerId(ownerId);
        long activeRentals = rentalRepository.countByOwnerIdAndStatus(ownerId, "OCUPADO");
        double occupancyRate = totalRentals > 0 ? (double) activeRentals / totalRentals * 100 : 0.0;

        BigDecimal monthlyIncome = transactionRepository.sumAmountByOwnerIdAndTypeAndMonthYear(ownerId, TransactionType.INGRESO, month, year);
        if (monthlyIncome == null) monthlyIncome = BigDecimal.ZERO;
        BigDecimal monthlyExpenses = transactionRepository.sumAmountByOwnerIdAndTypeAndMonthYear(ownerId, TransactionType.GASTO, month, year);
        if (monthlyExpenses == null) monthlyExpenses = BigDecimal.ZERO;

        // 2. Trend (Last 6 Months)
        List<DashboardResponse.HistoricalMetric> trend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate d = now.minusMonths(i);
            BigDecimal inc = transactionRepository.sumAmountByOwnerIdAndTypeAndMonthYear(ownerId, TransactionType.INGRESO, d.getMonthValue(), d.getYear());
            BigDecimal exp = transactionRepository.sumAmountByOwnerIdAndTypeAndMonthYear(ownerId, TransactionType.GASTO, d.getMonthValue(), d.getYear());
            trend.add(new DashboardResponse.HistoricalMetric(
                    d.getMonth().name().substring(0, 3), 
                    inc != null ? inc : BigDecimal.ZERO, 
                    exp != null ? exp : BigDecimal.ZERO));
        }

        // 3. Expense Distribution
        List<Object[]> distData = transactionRepository.sumAmountByOwnerIdGroupByCategory(ownerId);
        List<DashboardResponse.CategoryMetric> distribution = distData.stream()
                .map(obj -> new DashboardResponse.CategoryMetric(
                        obj[0] != null ? (String) obj[0] : "General", 
                        (BigDecimal) obj[1]))
                .toList();

        // 4. Property Performance (Drill-down)
        List<Rental> rentals = rentalRepository.findAllByOwnerId(ownerId);
        List<Transaction> allTxs = transactionRepository.findAllByOwnerId(ownerId);
        
        List<DashboardResponse.PropertyPerformance> performances = rentals.stream().map(r -> {
            BigDecimal rIncome = allTxs.stream()
                    .filter(t -> t.getRental() != null && t.getRental().getId().equals(r.getId()) && t.getType() == TransactionType.INGRESO && t.getDueDate().getMonthValue() == month && t.getDueDate().getYear() == year)
                    .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal rExpenses = allTxs.stream()
                    .filter(t -> t.getRental() != null && t.getRental().getId().equals(r.getId()) && t.getType() == TransactionType.GASTO && t.getDueDate().getMonthValue() == month && t.getDueDate().getYear() == year)
                    .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            return new DashboardResponse.PropertyPerformance(r.getName(), rIncome, rExpenses, rIncome.subtract(rExpenses), r.getStatus());
        }).toList();

        // 5. Recent Activity & Alerts
        List<Transaction> recent = transactionRepository.findTop5ByOwnerIdOrderByDueDateDesc(ownerId);
        List<TransactionResponse> recentTxs = recent.stream().map(this::mapToTransactionResponse).toList();

        List<Contract> expiring = contractRepository.findAllByOwnerIdAndStatusAndEndDateBetween(ownerId, ContractStatus.ACTIVE, now, now.plusDays(60));
        List<DashboardResponse.ContractAlert> alerts = expiring.stream()
                .map(c -> new DashboardResponse.ContractAlert(c.getRental().getName(), c.getTenant().getFullName(), c.getEndDate().toString()))
                .toList();

        return new DashboardResponse(
                totalRentals, activeRentals, occupancyRate, 
                monthlyIncome, monthlyExpenses, monthlyIncome.subtract(monthlyExpenses),
                0.0, BigDecimal.ZERO, 0, // Cleaned up unwanted metrics
                trend, distribution, performances, alerts, recentTxs
        );
    }

    private TransactionResponse mapToTransactionResponse(Transaction t) {
        return new TransactionResponse(t.getId(), t.getOwnerId(),
                t.getRental() != null ? t.getRental().getId() : null,
                t.getContract() != null ? t.getContract().getId() : null,
                t.getExpenseType() != null ? t.getExpenseType().getId() : null,
                t.getExpenseType() != null ? t.getExpenseType().getName() : null,
                t.getAmount(), t.getType(), t.getStatus(), t.getDueDate(), t.getPaymentDate(), t.getDescription());
    }
}
