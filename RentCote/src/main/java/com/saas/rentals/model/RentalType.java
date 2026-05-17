package com.saas.rentals.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "rental_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RentalType {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private UUID ownerId;
    @Column(nullable = false)
    private String name;
}
