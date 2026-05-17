package com.saas.rentals.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
    long totalRentals,
    long activeRentals,
    double occupancyRate,
    BigDecimal monthlyIncome,
    BigDecimal monthlyExpenses,
    BigDecimal netCashFlow,
    double averageGrossYield,
    BigDecimal next7DaysExpectedIncome,
    long openIncidents,
    List<HistoricalMetric> trend,
    List<CategoryMetric> expenseDistribution,
    List<PropertyPerformance> propertyPerformances,
    List<ContractAlert> upcomingExpirations,
    List<TransactionResponse> recentTransactions
) {
    public record HistoricalMetric(String month, BigDecimal income, BigDecimal expenses) {}
    public record CategoryMetric(String name, BigDecimal amount) {}
    public record PropertyPerformance(String name, BigDecimal income, BigDecimal expenses, BigDecimal profit, String status) {}
    public record ContractAlert(String rentalName, String tenantName, String endDate) {}
}
