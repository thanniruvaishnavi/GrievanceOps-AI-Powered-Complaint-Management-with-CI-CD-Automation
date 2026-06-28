package com.supportsaas.controller;

import com.supportsaas.dto.TicketResponse;
import com.supportsaas.security.CustomUserDetails;
import com.supportsaas.service.TicketService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resolver")
@RequiredArgsConstructor
@Tag(name = "Resolver", description = "Endpoints for the RESOLVER work queue")
public class ResolverController {

    private final TicketService ticketService;

    @GetMapping("/queue")
    public ResponseEntity<Page<TicketResponse>> myQueue(@AuthenticationPrincipal CustomUserDetails currentUser,
                                                          Pageable pageable) {
        return ResponseEntity.ok(ticketService.listAssignedTickets(currentUser, pageable));
    }
}
