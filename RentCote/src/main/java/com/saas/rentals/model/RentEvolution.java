package com.saas.rentals.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "rent_evolutions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RentEvolution {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(nullable = false)
    private BigDecimal amount;
    @Column(nullable = false)
    private LocalDate startDate;
    private String description;
}
