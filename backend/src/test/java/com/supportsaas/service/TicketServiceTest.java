package com.supportsaas.service;

import com.supportsaas.dto.MlAnalysisResponse;
import com.supportsaas.dto.TicketRequest;
import com.supportsaas.dto.TicketResponse;
import com.supportsaas.entity.*;
import com.supportsaas.repository.TicketRepository;
import com.supportsaas.repository.UserRepository;
import com.supportsaas.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock private TicketRepository ticketRepository;
    @Mock private UserRepository userRepository;
    @Mock private MlClientService mlClientService;

    @InjectMocks
    private TicketService ticketService;

    private User creator;
    private CustomUserDetails currentUser;

    @BeforeEach
    void setUp() {
        creator = User.builder().id(1L).email("user@example.com").role(Role.USER).build();
        currentUser = new CustomUserDetails(creator);
    }

    @Test
    void createTicket_enrichesWithMlAnalysis_andAssignsResolver() {
        TicketRequest request = new TicketRequest();
        request.setSubject("App crashes on login");
        request.setDescription("Every time I log in the app crashes immediately.");

        Ticket savedTicket = Ticket.builder()
                .id(10L)
                .subject(request.getSubject())
                .description(request.getDescription())
                .createdBy(creator)
                .status(TicketStatus.OPEN)
                .priority(Priority.MEDIUM)
                .build();

        when(ticketRepository.save(any(Ticket.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(mlClientService.analyze(any(), anyString(), anyString()))
                .thenReturn(MlAnalysisResponse.builder()
                        .category("LOGIN_BUG")
                        .priority("HIGH")
                        .sentimentScore(-0.6)
                        .isDuplicate(false)
                        .build());

        User resolver = User.builder().id(2L).email("resolver@example.com").role(Role.RESOLVER).build();
        when(userRepository.findByRole(Role.RESOLVER)).thenReturn(List.of(resolver));

        TicketResponse response = ticketService.createTicket(request, currentUser);

        assertEquals("LOGIN_BUG", response.getCategory());
        assertEquals(Priority.HIGH, response.getPriority());
        assertEquals(-0.6, response.getSentimentScore());
        assertEquals(TicketStatus.IN_PROGRESS, response.getStatus());
        verify(ticketRepository, times(2)).save(any(Ticket.class));
    }

    @Test
    void createTicket_marksDuplicate_whenMlFlagsIt() {
        TicketRequest request = new TicketRequest();
        request.setSubject("Cannot reset password");
        request.setDescription("Reset link does not work.");

        when(ticketRepository.save(any(Ticket.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(mlClientService.analyze(any(), anyString(), anyString()))
                .thenReturn(MlAnalysisResponse.builder()
                        .category("ACCOUNT")
                        .priority("LOW")
                        .sentimentScore(0.1)
                        .isDuplicate(true)
                        .duplicateOfTicketId(5L)
                        .build());

        TicketResponse response = ticketService.createTicket(request, currentUser);

        assertEquals(TicketStatus.DUPLICATE, response.getStatus());
        assertEquals(5L, response.getDuplicateOfTicketId());
        verify(userRepository, never()).findByRole(any());
    }
}
