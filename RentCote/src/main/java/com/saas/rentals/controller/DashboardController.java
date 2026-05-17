package com.saas.rentals.controller;

import com.saas.rentals.dto.DashboardResponse;
import com.saas.rentals.model.User;
import com.saas.rentals.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboardMetrics(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getDashboardMetrics(user.getId()));
    }
}
