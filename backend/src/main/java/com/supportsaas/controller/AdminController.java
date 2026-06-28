package com.supportsaas.controller;

import com.supportsaas.dto.TicketResponse;
import com.supportsaas.service.AnalyticsService;
import com.supportsaas.service.TicketService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only analytics and ticket oversight")
public class AdminController {

    private final TicketService ticketService;
    private final AnalyticsService analyticsService;

    @GetMapping("/tickets")
    public ResponseEntity<Page<TicketResponse>> allTickets(Pageable pageable) {
        return ResponseEntity.ok(ticketService.listAllTickets(pageable));
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<Map<String, Object>> dashboardSummary() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }
}
