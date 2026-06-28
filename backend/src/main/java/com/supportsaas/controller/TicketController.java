package com.supportsaas.controller;

import com.supportsaas.dto.TicketRequest;
import com.supportsaas.dto.TicketResponse;
import com.supportsaas.entity.TicketStatus;
import com.supportsaas.security.CustomUserDetails;
import com.supportsaas.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Create, view and manage support tickets")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @Operation(summary = "Create a ticket (auto-analyzed by the ML service)")
    public ResponseEntity<TicketResponse> create(@Valid @RequestBody TicketRequest request,
                                                  @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(ticketService.createTicket(request, currentUser));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single ticket by id")
    public ResponseEntity<TicketResponse> get(@PathVariable Long id,
                                               @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(ticketService.getTicket(id, currentUser));
    }

    @GetMapping("/mine")
    @Operation(summary = "List tickets created by the current user")
    public ResponseEntity<Page<TicketResponse>> myTickets(@AuthenticationPrincipal CustomUserDetails currentUser,
                                                           Pageable pageable) {
        return ResponseEntity.ok(ticketService.listMyTickets(currentUser, pageable));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RESOLVER','ADMIN')")
    @Operation(summary = "Update ticket status (assigned resolver or admin only)")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id,
                                                        @RequestParam TicketStatus status,
                                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(ticketService.updateStatus(id, status, currentUser));
    }
}
