package com.supportsaas.service;

import com.supportsaas.dto.MlAnalysisResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Talks to the FastAPI ML microservice for category classification,
 * priority prediction, sentiment analysis, and duplicate detection.
 * Fails soft: if the ML service is unreachable, ticket creation still
 * succeeds with sensible defaults rather than blocking the user.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MlClientService {

    private final RestClient mlServiceRestClient;

    public MlAnalysisResponse analyze(Long ticketId, String subject, String description) {
        try {
            return mlServiceRestClient.post()
                    .uri("/api/v1/analyze")
                    .body(Map.of(
                            "ticket_id", ticketId,
                            "subject", subject,
                            "description", description
                    ))
                    .retrieve()
                    .body(MlAnalysisResponse.class);
        } catch (Exception ex) {
            log.warn("ML service unavailable, falling back to defaults: {}", ex.getMessage());
            return MlAnalysisResponse.builder()
                    .category("UNCATEGORIZED")
                    .priority("MEDIUM")
                    .sentimentScore(0.0)
                    .isDuplicate(false)
                    .build();
        }
    }
}
