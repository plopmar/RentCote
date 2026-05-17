package com.saas.rentals.repository;

import com.saas.rentals.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    List<Tenant> findAllByOwnerId(UUID ownerId);
    Optional<Tenant> findByIdAndOwnerId(UUID id, UUID ownerId);
    void deleteByIdAndOwnerId(UUID id, UUID ownerId);
}
