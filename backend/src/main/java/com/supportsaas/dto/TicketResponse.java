package com.supportsaas.dto;

import com.supportsaas.entity.Priority;
import com.supportsaas.entity.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String subject;
    private String description;
    private String category;
    private Priority priority;
    private TicketStatus status;
    private Double sentimentScore;
    private Long duplicateOfTicketId;
    private String createdByEmail;
    private String assignedToEmail;
    private Instant createdAt;
    private Instant updatedAt;
}
