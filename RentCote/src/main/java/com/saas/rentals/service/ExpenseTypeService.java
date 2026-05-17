package com.saas.rentals.service;

import com.saas.rentals.dto.*; import com.saas.rentals.model.ExpenseType; import com.saas.rentals.repository.ExpenseTypeRepository;
import com.saas.rentals.exception.ResourceNotFoundException; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List; import java.util.UUID;

@Service @RequiredArgsConstructor
public class ExpenseTypeService {
    private final ExpenseTypeRepository repo;

    public ExpenseTypeResponse create(ExpenseTypeRequest req, UUID ownerId) {
        ExpenseType t = ExpenseType.builder().ownerId(ownerId).name(req.name()).build();
        ExpenseType saved = repo.save(t);
        return new ExpenseTypeResponse(saved.getId(), saved.getName());
    }

    @Transactional
    public List<ExpenseTypeResponse> getAll(UUID ownerId) {
        List<ExpenseType> types = repo.findAllByOwnerId(ownerId);
        if (types.isEmpty()) {
            // Seed defaults
            List<String> defaults = List.of("IBI", "Seguro", "Comunidad", "Reparación", "Suministros");
            defaults.forEach(d -> repo.save(ExpenseType.builder().ownerId(ownerId).name(d).build()));
            repo.flush();
            types = repo.findAllByOwnerId(ownerId);
        }
        return types.stream().map(t -> new ExpenseTypeResponse(t.getId(), t.getName())).toList();
    }

    public void delete(UUID id, UUID ownerId) {
        repo.findByIdAndOwnerId(id, ownerId).orElseThrow(() -> new ResourceNotFoundException("Expense type not found"));
        repo.deleteById(id);
    }
}
