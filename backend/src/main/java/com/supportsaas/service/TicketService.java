package com.supportsaas.service;

import com.supportsaas.dto.MlAnalysisResponse;
import com.supportsaas.dto.TicketRequest;
import com.supportsaas.dto.TicketResponse;
import com.supportsaas.entity.*;
import com.supportsaas.exception.ForbiddenException;
import com.supportsaas.exception.ResourceNotFoundException;
import com.supportsaas.repository.TicketRepository;
import com.supportsaas.repository.UserRepository;
import com.supportsaas.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final MlClientService mlClientService;

    @Transactional
    public TicketResponse createTicket(TicketRequest request, CustomUserDetails currentUser) {
        User creator = currentUser.getUser();

        Ticket ticket = Ticket.builder()
                .subject(request.getSubject())
                .description(request.getDescription())
                .createdBy(creator)
                .status(TicketStatus.OPEN)
                .priority(Priority.MEDIUM)
                .build();
        ticket = ticketRepository.save(ticket);

        // Enrich with ML predictions (category, priority, sentiment, duplicate flag)
        MlAnalysisResponse analysis = mlClientService.analyze(ticket.getId(), ticket.getSubject(), ticket.getDescription());

        ticket.setCategory(analysis.getCategory());
        ticket.setSentimentScore(analysis.getSentimentScore());
        try {
            ticket.setPriority(Priority.valueOf(analysis.getPriority()));
        } catch (Exception ignored) { /* keep default MEDIUM if ML returns something unexpected */ }

        if (analysis.isDuplicate() && analysis.getDuplicateOfTicketId() != null) {
            ticket.setStatus(TicketStatus.DUPLICATE);
            ticket.setDuplicateOfTicketId(analysis.getDuplicateOfTicketId());
        } else {
            autoAssignToResolver(ticket);
        }

        ticket = ticketRepository.save(ticket);
        return toResponse(ticket);
    }

    private void autoAssignToResolver(Ticket ticket) {
        List<User> resolvers = userRepository.findByRole(Role.RESOLVER);
        if (!resolvers.isEmpty()) {
            // simple round-robin via ticket id modulo, swap for least-loaded queue in a real system
            User resolver = resolvers.get((int) (ticket.getId() % resolvers.size()));
            ticket.setAssignedTo(resolver);
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
    }

    public TicketResponse getTicket(Long id, CustomUserDetails currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
        assertCanView(ticket, currentUser);
        return toResponse(ticket);
    }

    public Page<TicketResponse> listMyTickets(CustomUserDetails currentUser, Pageable pageable) {
        return ticketRepository.findByCreatedById(currentUser.getUser().getId(), pageable)
                .map(this::toResponse);
    }

    public Page<TicketResponse> listAssignedTickets(CustomUserDetails currentUser, Pageable pageable) {
        return ticketRepository.findByAssignedToId(currentUser.getUser().getId(), pageable)
                .map(this::toResponse);
    }

    public Page<TicketResponse> listAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public TicketResponse updateStatus(Long ticketId, TicketStatus newStatus, CustomUserDetails currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        boolean isAssignedResolver = ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getId().equals(currentUser.getUser().getId());
        boolean isAdmin = currentUser.getUser().getRole() == Role.ADMIN;

        if (!isAssignedResolver && !isAdmin) {
            throw new ForbiddenException("Only the assigned resolver or an admin can update this ticket");
        }

        ticket.setStatus(newStatus);
        ticket = ticketRepository.save(ticket);
        return toResponse(ticket);
    }

    private void assertCanView(Ticket ticket, CustomUserDetails currentUser) {
        User user = currentUser.getUser();
        boolean isOwner = ticket.getCreatedBy().getId().equals(user.getId());
        boolean isAssignee = ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAssignee && !isAdmin) {
            throw new ForbiddenException("You do not have access to this ticket");
        }
    }

    private TicketResponse toResponse(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .subject(t.getSubject())
                .description(t.getDescription())
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .sentimentScore(t.getSentimentScore())
                .duplicateOfTicketId(t.getDuplicateOfTicketId())
                .createdByEmail(t.getCreatedBy().getEmail())
                .assignedToEmail(Optional.ofNullable(t.getAssignedTo()).map(User::getEmail).orElse(null))
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
