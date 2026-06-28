package com.supportsaas.service;

import com.supportsaas.entity.Priority;
import com.supportsaas.entity.TicketStatus;
import com.supportsaas.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TicketRepository ticketRepository;

    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (TicketStatus status : TicketStatus.values()) {
            byStatus.put(status.name(), ticketRepository.countByStatus(status));
        }

        Map<String, Long> openByPriority = new LinkedHashMap<>();
        for (Priority priority : Priority.values()) {
            openByPriority.put(priority.name(), ticketRepository.countOpenByPriority(priority));
        }

        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (Object[] row : ticketRepository.countGroupedByCategory()) {
            String category = row[0] == null ? "UNCATEGORIZED" : row[0].toString();
            byCategory.put(category, (Long) row[1]);
        }

        summary.put("byStatus", byStatus);
        summary.put("openByPriority", openByPriority);
        summary.put("byCategory", byCategory);
        return summary;
    }
}
